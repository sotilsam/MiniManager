import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Edit2, Trash2, Plus, X, Save } from 'lucide-react';
import { differenceInDays, startOfDay } from 'date-fns';

export default function ActiveTasks() {
    const [tasks, setTasks] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', arrivalDate: '', taskDate: '' });

    useEffect(() => {
        if (!db) return;
        try {
            const q = query(collection(db, 'activeTasks'), orderBy('arrivalDate', 'desc'));
            const unsub = onSnapshot(q,
                (snapshot) => {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTasks(data);
                },
                (error) => console.error("Firebase fetch error (verify config):", error)
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

    const getRowColor = (days) => {
        if (days <= 3) return 'bg-green-100 hover:bg-green-200/60 text-emerald-900 border-b border-green-200';
        if (days <= 4) return 'bg-yellow-100 hover:bg-yellow-200/60 text-amber-900 border-b border-yellow-200';
        if (days <= 6) return 'bg-orange-100 hover:bg-orange-200/60 text-orange-900 border-b border-orange-200';
        return 'bg-red-100 hover:bg-red-200/60 text-red-900 border-b border-red-200';
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const handleAdd = async () => {
        // Only name is strictly required now. Defaults dates to today if left blank.
        if (!formData.name) return;

        const newRecord = {
            name: formData.name,
            arrivalDate: formData.arrivalDate || todayStr,
            taskDate: formData.taskDate || todayStr
        };

        try {
            await addDoc(collection(db, 'activeTasks'), newRecord);
            setIsAdding(false);
            setFormData({ name: '', arrivalDate: '', taskDate: '' });
        } catch (err) {
            console.error(err);
            alert("Error adding document. Check Firebase config.");
        }
    };

    const handleUpdate = async (id) => {
        if (!formData.name) return;

        const updatedRecord = {
            name: formData.name,
            arrivalDate: formData.arrivalDate || todayStr,
            taskDate: formData.taskDate || todayStr
        };

        try {
            await updateDoc(doc(db, 'activeTasks', id), updatedRecord);
            setEditingId(null);
            setFormData({ name: '', arrivalDate: '', taskDate: '' });
        } catch (err) {
            console.error(err);
            alert("Error updating document. Check Firebase config.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to remove this active task?')) {
            try {
                await deleteDoc(doc(db, 'activeTasks', id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setFormData({
            name: task.name,
            arrivalDate: task.arrivalDate || '',
            taskDate: task.taskDate || ''
        });
    };

    return (
        <div className="flex flex-col h-full rounded-2xl">
            <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-t-2xl gap-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                    Active Tasks
                </h2>
                <button
                    onClick={() => { setIsAdding(!isAdding); setEditingId(null); setFormData({ name: '', arrivalDate: '', taskDate: '' }) }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-95 w-full md:w-auto justify-center"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? 'Cancel' : 'New Task'}
                </button>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-50/50 rounded-b-2xl">
                <table className="w-full text-sm text-left block md:table">
                    <thead className="hidden md:table-header-group text-xs text-slate-500 uppercase bg-slate-100/80 sticky top-0 border-b border-slate-200 shadow-sm z-10">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider text-sm">Name</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-sm">Arrival Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-sm">Task Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-sm">Days Active</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="block md:table-row-group">
                        {(isAdding || tasks.length === 0) && isAdding && (
                            <tr className="block md:table-row bg-white border-b border-slate-200 shadow-sm relative z-0 p-4 md:p-0">
                                <td className="block md:table-cell px-2 py-2 md:px-4 md:py-3">
                                    <div className="md:hidden text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Name</div>
                                    <input type="text" className="w-full border-slate-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-blue-500 border focus:outline-none transition-shadow" placeholder="Employee Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </td>
                                <td className="block md:table-cell px-2 py-2 md:px-4 md:py-3">
                                    <div className="md:hidden text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Arrival Date</div>
                                    <input type="date" className="w-full border-slate-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-blue-500 border focus:outline-none transition-shadow" value={formData.arrivalDate} onChange={e => setFormData({ ...formData, arrivalDate: e.target.value })} />
                                </td>
                                <td className="block md:table-cell px-2 py-2 md:px-4 md:py-3">
                                    <div className="md:hidden text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Task Date</div>
                                    <input type="date" className="w-full border-slate-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-blue-500 border focus:outline-none transition-shadow" value={formData.taskDate} onChange={e => setFormData({ ...formData, taskDate: e.target.value })} />
                                </td>
                                <td className="hidden md:table-cell px-6 py-3 text-slate-400 font-medium">-</td>
                                <td className="block md:table-cell px-2 py-3 md:px-4 md:py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleAdd} className="flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-md transition-colors w-full md:w-8 h-10 md:h-8 font-semibold md:font-normal"><Save className="w-5 h-5 md:w-4 md:h-4 mr-2 md:mr-0" /> <span className="md:hidden">Save Task</span></button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {tasks.map(task => {
                            const isEditing = editingId === task.id;
                            const daysActive = calculateDays(task.arrivalDate);

                            if (isEditing) {
                                return (
                                    <tr key={task.id} className="block md:table-row bg-blue-50/50 border-b border-blue-100 p-4 md:p-0">
                                        <td className="block md:table-cell px-2 py-2 md:px-4 md:py-3">
                                            <div className="md:hidden text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Name</div>
                                            <input type="text" className="w-full border-blue-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-blue-500 border focus:outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </td>
                                        <td className="block md:table-cell px-2 py-2 md:px-4 md:py-3">
                                            <div className="md:hidden text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Arrival Date</div>
                                            <input type="date" className="w-full border-blue-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-blue-500 border focus:outline-none" value={formData.arrivalDate} onChange={e => setFormData({ ...formData, arrivalDate: e.target.value })} />
                                        </td>
                                        <td className="block md:table-cell px-2 py-2 md:px-4 md:py-3">
                                            <div className="md:hidden text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Task Date</div>
                                            <input type="date" className="w-full border-blue-200 rounded-md text-sm p-2 focus:ring-2 focus:ring-blue-500 border focus:outline-none" value={formData.taskDate} onChange={e => setFormData({ ...formData, taskDate: e.target.value })} />
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-3 text-blue-800 font-medium">{daysActive}</td>
                                        <td className="block md:table-cell px-2 py-3 md:px-4 md:py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleUpdate(task.id)} className="flex flex-1 md:flex-none items-center justify-center bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-md transition-colors h-10 md:h-8"><Save className="w-5 h-5 md:w-4 md:h-4 mr-1 md:mr-0" /> <span className="md:hidden font-semibold">Save</span></button>
                                                <button onClick={() => setEditingId(null)} className="flex flex-1 md:flex-none items-center justify-center bg-slate-200 text-slate-600 hover:bg-slate-300 p-2 rounded-md transition-colors h-10 md:h-8"><X className="w-5 h-5 md:w-4 md:h-4 mr-1 md:mr-0" /> <span className="md:hidden font-semibold">Cancel</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr key={task.id} className={`block md:table-row border-b md:border-b-0 border-slate-200 p-4 md:p-0 transition-colors ${getRowColor(daysActive)}`}>
                                    <td className="block md:table-cell px-2 py-1.5 md:px-6 md:py-4">
                                        <div className="flex justify-between items-center md:block">
                                            <span className="md:hidden font-bold text-slate-500/80 text-[11px] uppercase tracking-wider">Name</span>
                                            <span className="font-semibold break-words text-sm md:text-base text-right md:text-left">{task.name}</span>
                                        </div>
                                    </td>
                                    <td className="block md:table-cell px-2 py-1.5 md:px-6 md:py-4">
                                        <div className="flex justify-between items-center md:block">
                                            <span className="md:hidden font-bold text-slate-500/80 text-[11px] uppercase tracking-wider">Arrival Date</span>
                                            <span className="text-slate-700 font-medium text-sm md:text-base">{task.arrivalDate}</span>
                                        </div>
                                    </td>
                                    <td className="block md:table-cell px-2 py-1.5 md:px-6 md:py-4">
                                        <div className="flex justify-between items-center md:block">
                                            <span className="md:hidden font-bold text-slate-500/80 text-[11px] uppercase tracking-wider">Task Date</span>
                                            <span className="text-slate-700 font-medium text-sm md:text-base">{task.taskDate}</span>
                                        </div>
                                    </td>
                                    <td className="block md:table-cell px-2 py-1.5 md:px-6 md:py-4">
                                        <div className="flex justify-between items-center md:block">
                                            <span className="md:hidden font-bold text-slate-500/80 text-[11px] uppercase tracking-wider">Days Active</span>
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-white/50 text-xs font-bold shadow-sm">
                                                {daysActive} {daysActive === 1 ? 'day' : 'days'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="block md:table-cell px-2 pt-3 pb-1 mt-2 border-t border-slate-200/50 md:border-none md:mt-0 md:pt-4 md:pb-4 md:px-4 text-right">
                                        <div className="flex justify-end gap-2 w-full md:w-auto">
                                            <button onClick={() => startEdit(task)} className="flex-1 md:flex-none flex items-center justify-center bg-white/60 text-blue-700 hover:bg-blue-100 hover:text-blue-800 p-2 rounded-lg md:rounded-md transition-colors shadow-sm" title="Edit"><Edit2 className="w-5 h-5 md:w-4 md:h-4" /></button>
                                            <button onClick={() => handleDelete(task.id)} className="flex-1 md:flex-none flex items-center justify-center bg-white/60 text-red-600 hover:bg-red-200 hover:text-red-700 p-2 rounded-lg md:rounded-md transition-colors shadow-sm" title="Delete"><Trash2 className="w-5 h-5 md:w-4 md:h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {tasks.length === 0 && !isAdding && (
                            <tr className="block md:table-row">
                                <td colSpan="5" className="block md:table-cell px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <div className="bg-slate-100 p-3 rounded-full mb-3 shadow-sm">
                                            <Plus className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm font-medium">No active tasks found</p>
                                        <p className="text-xs mt-1">Click "New Task" to create your first record.</p>
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
