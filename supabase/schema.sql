-- InsureCompare Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (lightweight, no password auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  surname TEXT,
  id_number TEXT,
  age TEXT,
  occupation TEXT,
  family_composition TEXT,
  income_bracket TEXT,
  region TEXT,
  primary_priority TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comparison sessions table
CREATE TABLE comparison_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  providers JSONB NOT NULL,
  categories JSONB NOT NULL,
  report_title_override TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES comparison_sessions(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (users can only see their own data)
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients" ON clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own clients" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for comparison_sessions
CREATE POLICY "Users can view their own sessions" ON comparison_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sessions" ON comparison_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" ON comparison_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions" ON comparison_sessions
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM comparison_sessions WHERE id = audit_logs.session_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM clients WHERE id = audit_logs.client_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM comparison_sessions WHERE id = audit_logs.session_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM clients WHERE id = audit_logs.client_id AND user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_comparison_sessions_user_id ON comparison_sessions(user_id);
CREATE INDEX idx_comparison_sessions_client_id ON comparison_sessions(client_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparison_sessions_updated_at
  BEFORE UPDATE ON comparison_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable automatic audit logging via triggers
CREATE OR REPLACE FUNCTION log_audit_action()
RETURNS TRIGGER AS $$
DECLARE
  audit_user_id UUID;
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Get user_id from context or use current_setting
  audit_user_id := auth.uid();
  
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    new_data := NULL;
    INSERT INTO audit_logs (user_id, action, old_data, new_data)
    VALUES (audit_user_id, TG_TABLE_NAME || '_delete', old_data, new_data);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    INSERT INTO audit_logs (user_id, session_id, client_id, action, old_data, new_data)
    VALUES (
      audit_user_id,
      COALESCE(NEW.session_id, OLD.session_id),
      COALESCE(NEW.client_id, OLD.client_id),
      TG_TABLE_NAME || '_update',
      old_data,
      new_data
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    old_data := NULL;
    new_data := to_jsonb(NEW);
    INSERT INTO audit_logs (user_id, session_id, client_id, action, old_data, new_data)
    VALUES (
      audit_user_id,
      NEW.session_id,
      NEW.client_id,
      TG_TABLE_NAME || '_insert',
      old_data,
      new_data
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Enable realtime for comparison_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE comparison_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
