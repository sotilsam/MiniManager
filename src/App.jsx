import React, { useState, useEffect, useRef } from 'react';
import ActiveTasks from './components/ActiveTasks';
import EmployeesAtHome from './components/EmployeesAtHome';
import SystemCertifications from './components/SystemCertifications';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [noteText, setNoteText] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current && currentPage === '1') {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [noteText, currentPage]);

    const handleCopy = () => {
        navigator.clipboard.writeText(noteText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (!db) return;
        getDoc(doc(db, 'globalNotes', 'tabOne')).then(docSnap => {
            if (docSnap.exists()) {
                setNoteText(docSnap.data().text || '');
            }
            setIsLoaded(true);
        }).catch(err => {
            console.error("Error fetching note:", err);
            setIsLoaded(true);
        });
    }, []);

    useEffect(() => {
        // Don't auto-save before initial load completes or if there wasn't a manual edit
        if (!isLoaded || saveStatus === '') return;

        const handler = setTimeout(async () => {
            try {
                setSaveStatus('Saving...');
                await setDoc(doc(db, 'globalNotes', 'tabOne'), { text: noteText }, { merge: true });
                setSaveStatus('Saved');

                // Clear the 'Saved' status after 2 seconds unless user started typing again
                setTimeout(() => setSaveStatus(s => s === 'Saved' ? '' : s), 2000);
            } catch (err) {
                console.error("Error saving note:", err);
                setSaveStatus('Error saving');
            }
        }, 1000);

        return () => clearTimeout(handler);
    }, [noteText, isLoaded]);

    const handleNoteChange = (e) => {
        setNoteText(e.target.value);
        setSaveStatus('Typing...');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-[90rem] mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between w-full h-auto md:h-16 py-3 md:py-0">
                        <div className="flex-shrink-0 font-bold text-xl text-blue-600 tracking-tight mb-2 md:mb-0">
                            MiniManager
                        </div>
                        <div className="flex items-center justify-center space-x-4 md:space-x-8 h-10 md:h-full w-full md:w-auto">
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
                            <button
                                onClick={() => setCurrentPage('1')}
                                className={`inline-flex items-center px-1 pt-1 h-full border-b-2 font-semibold text-sm transition-colors ${currentPage === '1'
                                    ? 'border-blue-600 text-slate-900'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                            >
                                1
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

                    {currentPage === '1' && (
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-2xl">
                                <div className="flex justify-between items-center mb-4 flex-row-reverse">
                                    <div className="text-sm text-slate-400 font-medium">
                                        {saveStatus === 'Saving...' && <span className="text-blue-500">saving...</span>}
                                        {saveStatus === 'Saved' && <span className="text-green-500"> saved successfully ✓</span>}
                                        {saveStatus === 'Error saving' && <span className="text-red-500">saving error</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCopy}
                                            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 active:scale-95"
                                        >
                                            {copied ? 'Copied ✓' : 'Copy All'}
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    dir="rtl"
                                    lang="he"
                                    placeholder="..."
                                    value={noteText}
                                    onChange={handleNoteChange}
                                    ref={textareaRef}
                                    disabled={!isLoaded}
                                    className="w-full min-h-[250px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y text-lg text-slate-800 transition-shadow disabled:opacity-50"
                                ></textarea>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default App;
