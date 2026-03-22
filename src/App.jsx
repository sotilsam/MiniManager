import React, { useState } from 'react';
import ActiveTasks from './components/ActiveTasks';
import EmployeesAtHome from './components/EmployeesAtHome';
import SystemCertifications from './components/SystemCertifications';

function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-[90rem] mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between w-full h-16">
                        <div className="flex-shrink-0 font-bold text-xl text-blue-600 tracking-tight">
                            MiniManager
                        </div>
                        <div className="flex items-center space-x-8 h-full">
                            <button
                                onClick={() => setCurrentPage('dashboard')}
                                className={`inline-flex items-center px-1 pt-1 h-full border-b-2 font-semibold text-sm transition-colors ${currentPage === 'dashboard'
                                        ? 'border-blue-600 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setCurrentPage('certifications')}
                                className={`inline-flex items-center px-1 pt-1 h-full border-b-2 font-semibold text-sm transition-colors ${currentPage === 'certifications'
                                        ? 'border-blue-600 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                            >
                                System Certifications
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-8">
                <div className="max-w-[90rem] mx-auto space-y-8">

                    {currentPage === 'dashboard' && (
                        <>
                            <header className="mb-4">
                                <h1 className="text-3xl tracking-tight font-extrabold text-slate-900 sm:text-4xl text-center md:text-left">Team Management</h1>
                                <p className="text-slate-500 mt-2 text-lg text-center md:text-left">Real-time overview of active tasks and personnel at home.</p>
                            </header>

                            <main className="grid grid-cols-1 gap-12 items-start">
                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                                    <ActiveTasks />
                                </section>

                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                                    <EmployeesAtHome />
                                </section>
                            </main>
                        </>
                    )}

                    {currentPage === 'certifications' && (
                        <SystemCertifications />
                    )}

                </div>
            </div>
        </div>
    );
}

export default App;
