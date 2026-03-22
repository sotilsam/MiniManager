import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Edit2, Trash2, Plus, X, Save, Home } from 'lucide-react';
import { differenceInDays, startOfDay } from 'date-fns';

export default function EmployeesAtHome() {
    const [employees, setEmployees] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', startDate: '' });

    useEffect(() => {
        if (!db) return;
        try {
            const q = query(collection(db, 'employeesAtHome'), orderBy('startDate', 'desc'));
            const unsub = onSnapshot(q,
                (snapshot) => {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setEmployees(data);
                },
                (error) => console.error("Firebase fetch error:", error)
            );
            return () => unsub();
        } catch (err) {
            console.error("Firebase is likely not configured yet.", err);
        }
    }, []);

    const calculateDays = (dateString) => {
        if (!dateString) return 0;
        return Math.max(0, differenceInDays(startOfDay(new Date()), startOfDay(new Date(dateString))));
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const handleAdd = async () => {
        if (!formData.name) return;

        const newRecord = {
            name: formData.name,
            startDate: formData.startDate || todayStr
        };

        try {
            await addDoc(collection(db, 'employeesAtHome'), newRecord);
            setIsAdding(false);
            setFormData({ name: '', startDate: '' });
        } catch (err) {
            console.error(err);
            alert("Error adding document. Check Firebase config.");
        }
    };

    const handleUpdate = async (id) => {
        if (!formData.name) return;

        const updatedRecord = {
            name: formData.name,
            startDate: formData.startDate || todayStr
        };

        try {
            await updateDoc(doc(db, 'employeesAtHome', id), updatedRecord);
            setEditingId(null);
            setFormData({ name: '', startDate: '' });
        } catch (err) {
            console.error(err);
            alert("Error updating document.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to remove this employee from the home list?')) {
            try {
                await deleteDoc(doc(db, 'employeesAtHome', id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const startEdit = (emp) => {
        setEditingId(emp.id);
        setFormData({
            name: emp.name,
            startDate: emp.startDate || ''
        });
    };

    return (
        <div className="flex flex-col h-full rounded-2xl">
            <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-t-2xl gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
                    At Home
                </h2>
                <button
                    onClick={() => { setIsAdding(!isAdding); setEditingId(null); setFormData({ name: '', startDate: '' }) }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 w-full md:w-auto justify-center"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? 'Cancel' : 'New Record'}
                </button>
            </div>

            <div className="flex-1 overflow-x-auto bg-slate-50/50 rounded-b-2xl">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-100/80 sticky top-0 border-b border-slate-200 shadow-sm z-10">
                        <tr>
                            <th className="px-3 py-3 md:px-6 md:py-4 font-semibold tracking-wider text-xs md:text-sm">Name</th>
                            <th className="px-3 py-3 md:px-6 md:py-4 font-semibold tracking-wider text-xs md:text-sm">Stay Start Date</th>
                            <th className="px-3 py-3 md:px-6 md:py-4 font-semibold tracking-wider text-xs md:text-sm">Total Days at Home</th>
                            <th className="px-3 py-3 md:px-6 md:py-4 font-semibold tracking-wider text-xs md:text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(isAdding || employees.length === 0) && isAdding && (
                            <tr className="bg-white border-b border-slate-200 shadow-sm relative z-0">
                                <td className="px-4 py-3 min-w-[150px]">
                                    <input type="text" className="w-full border-slate-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-indigo-500 border focus:outline-none transition-shadow" placeholder="Employee Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </td>
                                <td className="px-4 py-3 min-w-[140px]">
                                    <input type="date" className="w-full border-slate-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-indigo-500 border focus:outline-none transition-shadow" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                </td>
                                <td className="px-6 py-3 text-slate-400 font-medium">-</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleAdd} className="flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-md transition-colors w-8 h-8"><Save className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {employees.map(emp => {
                            const isEditing = editingId === emp.id;
                            const daysAtHome = calculateDays(emp.startDate);

                            if (isEditing) {
                                return (
                                    <tr key={emp.id} className="bg-indigo-50/50 border-b border-indigo-100">
                                        <td className="px-4 py-3 min-w-[150px]"><input type="text" className="w-full border-indigo-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-indigo-500 border focus:outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></td>
                                        <td className="px-4 py-3 min-w-[140px]"><input type="date" className="w-full border-indigo-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-indigo-500 border focus:outline-none" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} /></td>
                                        <td className="px-6 py-3 text-indigo-800 font-medium">{daysAtHome}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleUpdate(emp.id)} className="flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-md transition-colors w-8 h-8"><Save className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingId(null)} className="flex items-center justify-center bg-slate-200 text-slate-600 hover:bg-slate-300 p-2 rounded-md transition-colors w-8 h-8"><X className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={emp.id} className="transition-colors hover:bg-slate-100/50 border-b border-slate-100 last:border-0">
                                    <td className="px-3 py-3 md:px-6 md:py-4 font-semibold text-slate-800 break-words max-w-[100px] md:max-w-none md:min-w-[150px] text-xs md:text-sm">{emp.name}</td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600 font-medium whitespace-nowrap text-xs md:text-sm">{emp.startDate}</td>
                                    <td className="px-3 py-3 md:px-6 md:py-4 font-bold whitespace-nowrap">
                                        <span className="inline-flex items-center justify-center px-2 py-1 md:px-3 md:py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] md:text-xs shadow-sm ring-1 ring-inset ring-indigo-200">
                                            {daysAtHome} {daysAtHome === 1 ? 'day' : 'days'}
                                        </span>
                                    </td>
                                    <td className="px-1 py-3 md:px-4 md:py-4 text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-1 md:gap-2">
                                            <button onClick={() => startEdit(emp)} className="bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 p-1.5 md:p-2 rounded-md transition-colors shadow-sm ring-1 ring-slate-200" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(emp.id)} className="bg-white text-red-500 hover:bg-red-50 hover:text-red-700 p-1.5 md:p-2 rounded-md transition-colors shadow-sm ring-1 ring-slate-200" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {employees.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <div className="bg-slate-100 p-3 rounded-full mb-3 shadow-sm">
                                            <Home className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm font-medium">No home records found</p>
                                        <p className="text-xs mt-1">Click "New Record" to add someone to this list.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
