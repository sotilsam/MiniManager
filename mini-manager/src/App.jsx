import React from 'react';
import ActiveTasks from './components/ActiveTasks';
import EmployeesAtHome from './components/EmployeesAtHome';

function App() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-[90rem] mx-auto space-y-8">
                <header className="mb-8">
                    <h1 className="text-3xl tracking-tight font-extrabold text-slate-900 sm:text-4xl text-center md:text-left">Management Dashboard</h1>
                    <p className="text-slate-500 mt-2 text-lg text-center md:text-left">Overview of active tasks and personnel at home.</p>
                </header>

                {/* Changed grid-cols-1 lg:grid-cols-2 to just grid-cols-1 to stack them vertically on all screen sizes */}
                <main className="grid grid-cols-1 gap-12 items-start">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                        <ActiveTasks />
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                        <EmployeesAtHome />
                    </section>
                </main>
            </div>
        </div>
    );
}

export default App;
