import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove, query } from 'firebase/firestore';
import { Search, Plus, Trash2, Edit2, UserPlus, X, Save, Server, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSystem({
    system,
    isEditing,
    editingSystemName,
    setEditingSystemName,
    handleUpdateSystem,
    setEditingSystemId,
    addingEmployeeTo,
    setAddingEmployeeTo,
    newEmployeeName,
    setNewEmployeeName,
    handleAddEmployee,
    handleDeleteSystem,
    handleRemoveEmployee,
    disabled
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: system.id,
        disabled: disabled || isEditing || addingEmployeeTo === system.id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 10, backgroundColor: 'var(--color-slate-50)' } : {})
    };

    const employees = system.employees || [];

    return (
        <tbody ref={setNodeRef} style={style} className={isDragging ? 'opacity-80 drop-shadow-xl' : ''}>
            {/* SYSTEM HEADER ROW */}
            <tr className="bg-slate-100 border-b border-slate-200 group h-14">
                <td className="px-2 py-3 align-middle w-8">
                    <div className="flex items-center justify-center h-full">
                        <button {...attributes} {...listeners} className={`flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-grab ${disabled || isEditing || addingEmployeeTo === system.id ? 'opacity-0 pointer-events-none cursor-default' : ''}`}>
                            <GripVertical className="w-5 h-5" />
                        </button>
                    </div>
                </td>
                <td className="px-6 py-3 font-bold text-slate-800 align-middle">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                autoFocus
                                value={editingSystemName}
                                onChange={(e) => setEditingSystemName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateSystem(system.id)}
                                className="border border-slate-300 rounded p-1 font-normal outline-none focus:border-blue-500 flex-1 max-w-xs bg-white"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 h-full">
                            <Server className="w-4 h-4 text-slate-500" />
                            <span>{system.systemName}</span>
                            <span className="text-slate-400 font-normal text-xs ml-2">({employees.length} certified)</span>
                        </div>
                    )}
                </td>
                <td className="px-6 py-3 text-right align-middle">
                    {isEditing ? (
                        <>
                            <button onClick={() => handleUpdateSystem(system.id)} className="text-green-600 font-medium hover:underline mr-4 cursor-pointer">Save</button>
                            <button onClick={() => setEditingSystemId(null)} className="text-slate-500 font-medium hover:underline cursor-pointer">Cancel</button>
                        </>
                    ) : (
                        <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setAddingEmployeeTo(system.id); setNewEmployeeName(''); }}
                                className="text-blue-600 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" /> Add
                            </button>
                            <span className="text-slate-300">|</span>
                            <button onClick={() => { setEditingSystemId(system.id); setEditingSystemName(system.systemName); }} className="text-slate-500 hover:text-slate-800 cursor-pointer" title="Edit System"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteSystem(system.id, system.systemName)} className="text-slate-500 hover:text-red-600 cursor-pointer" title="Delete System"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    )}
                </td>
            </tr>

            {/* ADDING EMPLOYEE INNER ROW */}
            {addingEmployeeTo === system.id && (
                <tr className="bg-white border-b border-slate-200">
                    <td className="px-2 py-2"></td>
                    <td className="px-6 py-2 pl-12">
                        <input
                            type="text"
                            autoFocus
                            placeholder="Employee name..."
                            value={newEmployeeName}
                            onChange={(e) => setNewEmployeeName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddEmployee(system.id)}
                            className="border border-slate-300 rounded p-1.5 focus:border-blue-500 outline-none text-sm w-full max-w-xs bg-white"
                        />
                    </td>
                    <td className="px-6 py-2 text-right">
                        <button onClick={() => handleAddEmployee(system.id)} className="text-blue-600 font-medium hover:underline mr-4 cursor-pointer">Add</button>
                        <button onClick={() => setAddingEmployeeTo(null)} className="text-slate-500 font-medium hover:underline cursor-pointer">Cancel</button>
                    </td>
                </tr>
            )}

            {/* EMPLOYEES ROWS */}
            {employees.length === 0 ? (
                <tr className="bg-white border-b border-slate-100">
                    <td className="px-2 py-4"></td>
                    <td colSpan="2" className="px-6 py-4 pl-12 text-slate-400 italic text-sm">
                        No one certified.
                    </td>
                </tr>
            ) : (
                employees.map((emp, idx) => (
                    <tr key={idx} className="bg-white border-b border-slate-100 hover:bg-slate-50 group">
                        <td className="px-2 py-3"></td>
                        <td className="px-6 py-3 pl-12 text-slate-700 font-medium">
                            {emp}
                        </td>
                        <td className="px-6 py-3 text-right">
                            <button
                                onClick={() => handleRemoveEmployee(system.id, emp)}
                                className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium text-xs flex items-center justify-end w-full gap-1 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" /> Remove
                            </button>
                        </td>
                    </tr>
                ))
            )}
        </tbody>
    );
}

export default function SystemCertifications() {
    const [systems, setSystems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingSystem, setIsAddingSystem] = useState(false);
    const [newSystemName, setNewSystemName] = useState('');

    const [editingSystemId, setEditingSystemId] = useState(null);
    const [editingSystemName, setEditingSystemName] = useState('');
    const [addingEmployeeTo, setAddingEmployeeTo] = useState(null);
    const [newEmployeeName, setNewEmployeeName] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (!db) return;
        try {
            const q = query(collection(db, 'certifications'));
            const unsub = onSnapshot(q,
                (snapshot) => {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    // Sort by order safely
                    data.sort((a, b) => {
                        const orderA = a.order !== undefined ? a.order : 999999;
                        const orderB = b.order !== undefined ? b.order : 999999;
                        if (orderA !== orderB) return orderA - orderB;
                        return (a.systemName || '').localeCompare(b.systemName || '');
                    });
                    setSystems(data);
                },
                (error) => console.error("Firebase fetch error:", error)
            );
            return () => unsub();
        } catch (err) {
            console.error(err);
        }
    }, []);

    const handleAddSystem = async () => {
        if (!newSystemName.trim()) return;
        try {
            const newOrder = systems.length > 0 ? (systems[systems.length - 1].order !== undefined ? systems[systems.length - 1].order + 1 : systems.length) : 0;
            await addDoc(collection(db, 'certifications'), {
                systemName: newSystemName.trim(),
                employees: [],
                order: newOrder
            });
            setNewSystemName('');
            setIsAddingSystem(false);
        } catch (err) {
            console.error(err);
            alert("Error adding system");
        }
    };

    const handleUpdateSystem = async (id) => {
        if (!editingSystemName.trim()) return;
        try {
            await updateDoc(doc(db, 'certifications', id), {
                systemName: editingSystemName.trim()
            });
            setEditingSystemId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSystem = async (id, name) => {
        if (confirm(`Are you sure you want to completely delete the "${name}" system and all its certification records?`)) {
            await deleteDoc(doc(db, 'certifications', id));
        }
    };

    const handleAddEmployee = async (systemId) => {
        if (!newEmployeeName.trim()) return;
        try {
            await updateDoc(doc(db, 'certifications', systemId), {
                employees: arrayUnion(newEmployeeName.trim())
            });
            setAddingEmployeeTo(null);
            setNewEmployeeName('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveEmployee = async (systemId, empName) => {
        if (confirm(`Remove ${empName} from this system's certifications?`)) {
            try {
                await updateDoc(doc(db, 'certifications', systemId), {
                    employees: arrayRemove(empName)
                });
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = systems.findIndex((sys) => sys.id === active.id);
        const newIndex = systems.findIndex((sys) => sys.id === over.id);

        const newSystems = arrayMove(systems, oldIndex, newIndex);
        setSystems(newSystems); // Optimistic

        try {
            const updates = newSystems.map((sys, index) => {
                return updateDoc(doc(db, 'certifications', sys.id), { order: index });
            });
            await Promise.all(updates);
        } catch (err) {
            console.error("Error updating sequence:", err);
        }
    };

    const filteredSystems = systems.filter(sys =>
        sys.systemName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow border border-slate-200">

            {/* Header and Toolbar */}
            <div className="p-6 border-b border-slate-200">
                <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Certifications</h1>
                        <p className="text-slate-500 mt-1 text-sm">Operational Readiness & Certifications</p>
                    </div>

                    <button
                        onClick={() => { setIsAddingSystem(true); setNewSystemName(''); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </header>

                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search systems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Main Table Area */}
            <div className="overflow-x-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase">
                            <tr>
                                <th scope="col" className="px-2 py-3 font-semibold w-8"></th>
                                <th scope="col" className="px-6 py-3 font-semibold">System & Personnel</th>
                                <th scope="col" className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>

                        {/* In-Line Add System Form Row */}
                        {isAddingSystem && (
                            <tbody>
                                <tr className="bg-blue-50 border-b border-slate-200">
                                    <td className="px-2 py-3"></td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <Server className="w-4 h-4 text-blue-600" />
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Enter new system name..."
                                                value={newSystemName}
                                                onChange={(e) => setNewSystemName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddSystem()}
                                                className="border border-blue-300 rounded-md p-1.5 focus:border-blue-500 outline-none flex-1 max-w-xs bg-white"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button onClick={handleAddSystem} className="text-blue-600 hover:underline font-medium mr-4 cursor-pointer">Save</button>
                                        <button onClick={() => setIsAddingSystem(false)} className="text-slate-500 hover:underline font-medium cursor-pointer">Cancel</button>
                                    </td>
                                </tr>
                            </tbody>
                        )}

                        <SortableContext items={filteredSystems.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            {filteredSystems.map((system) => (
                                <SortableSystem
                                    key={system.id}
                                    system={system}
                                    isEditing={editingSystemId === system.id}
                                    editingSystemName={editingSystemName}
                                    setEditingSystemName={setEditingSystemName}
                                    handleUpdateSystem={handleUpdateSystem}
                                    setEditingSystemId={setEditingSystemId}
                                    addingEmployeeTo={addingEmployeeTo}
                                    setAddingEmployeeTo={setAddingEmployeeTo}
                                    newEmployeeName={newEmployeeName}
                                    setNewEmployeeName={setNewEmployeeName}
                                    handleAddEmployee={handleAddEmployee}
                                    handleDeleteSystem={handleDeleteSystem}
                                    handleRemoveEmployee={handleRemoveEmployee}
                                    disabled={isSearching}
                                />
                            ))}
                        </SortableContext>

                        {/* Empty State */}
                        {filteredSystems.length === 0 && !isAddingSystem && (
                            <tbody>
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center">
                                        <h3 className="text-sm font-semibold text-slate-700">No Systems Found</h3>
                                        <p className="text-slate-500 text-sm mt-1">There are no systems matching your search.</p>
                                    </td>
                                </tr>
                            </tbody>
                        )}

                    </table>
                </DndContext>
            </div>

        </div>
    );
}
