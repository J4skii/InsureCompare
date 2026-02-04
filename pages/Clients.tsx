import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dataLayer, DataSource } from '../lib/data-layer';
import { Icons } from '../constants';
import type { DatabaseClient } from '../types';

const Clients: React.FC = () => {
    const [clients, setClients] = useState<DatabaseClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dataSource, setDataSource] = useState<DataSource>('localstorage');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        try {
            const source = await dataLayer.init();
            setDataSource(source);
            const clientList = await dataLayer.getClients();
            setClients(clientList);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter((client) =>
        client.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.id_number?.includes(searchQuery)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Client Management</h2>
                    <p className="text-slate-500">
                        Manage your client database {dataSource === 'supabase' ? '(Cloud)' : '(Local)'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span
                            className={`w-2 h-2 rounded-full ${dataSource === 'supabase' ? 'bg-green-500' : 'bg-amber-500'
                                }`}
                        />
                        {dataSource === 'supabase' ? 'Connected to Cloud' : 'Local Mode'}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Icons.FileText />
                    <input
                        type="text"
                        placeholder="Search clients by name, surname, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Clients Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.FileText />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {clients.length === 0 ? 'No clients yet' : 'No matches found'}
                    </h3>
                    <p className="text-slate-500 mb-6">
                        {clients.length === 0
                            ? 'Create your first client to start building your database.'
                            : 'Try a different search term.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">
                                            {client.member_name.charAt(0)}
                                            {client.surname?.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {client.member_name} {client.surname}
                                        </h3>
                                        <p className="text-sm text-slate-500">{client.id_number}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                {client.age && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Age</span>
                                        <span className="font-medium">{client.age}</span>
                                    </div>
                                )}
                                {client.family_composition && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Family</span>
                                        <span className="font-medium">{client.family_composition}</span>
                                    </div>
                                )}
                                {client.region && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Region</span>
                                        <span className="font-medium">{client.region}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <Link
                                    to={`/client/${client.id}`}
                                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                                >
                                    View Client Profile →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Clients;
