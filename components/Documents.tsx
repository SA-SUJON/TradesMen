
import React, { useState, useRef } from 'react';
import { Card, Input, Button } from './ui/BaseComponents';
import { FolderOpen, Plus, Image as ImageIcon, FileText, Trash2, X, Eye, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppDocument } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Documents: React.FC = () => {
    const { theme } = useTheme();
    const [docs, setDocs] = useLocalStorage<AppDocument[]>('tradesmen-docs', []);
    const [isAdding, setIsAdding] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<AppDocument | null>(null);
    
    // Form State
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState(''); // Text content or base64 image
    const [newType, setNewType] = useState<'image' | 'text'>('text');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewContent(reader.result as string);
                setNewType('image');
                if (!newTitle) setNewTitle(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!newTitle || !newContent) return;
        const newDoc: AppDocument = {
            id: Date.now().toString(),
            title: newTitle,
            type: newType,
            content: newContent,
            date: new Date().toISOString()
        };
        setDocs(prev => [newDoc, ...prev]);
        resetForm();
    };

    const deleteDoc = (id: string) => {
        if (window.confirm("Delete this document?")) {
            setDocs(prev => prev.filter(d => d.id !== id));
            setPreviewDoc(null);
        }
    };

    const resetForm = () => {
        setNewTitle('');
        setNewContent('');
        setNewType('text');
        setIsAdding(false);
    };

    return (
        <div className="space-y-6 pb-24">
            <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Digital Locker</h2>
                        <p className="opacity-80 text-sm">Securely store licenses, proofs, and notes</p>
                    </div>
                </div>
            </Card>

            {/* Controls */}
            <div className="flex justify-end">
                <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Document
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {docs.length > 0 ? docs.map(doc => (
                    <motion.div
                        key={doc.id}
                        layout
                        onClick={() => setPreviewDoc(doc)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative cursor-pointer"
                    >
                        <div className="aspect-[3/4] bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            {doc.type === 'image' ? (
                                <img src={doc.content} alt={doc.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="p-4 text-xs opacity-60 overflow-hidden h-full break-words bg-yellow-50 dark:bg-yellow-900/10 text-yellow-900 dark:text-yellow-100">
                                    {doc.content}
                                </div>
                            )}
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                                <div className="text-white font-bold text-sm truncate">{doc.title}</div>
                                <div className="text-white/60 text-[10px] flex items-center gap-1">
                                    {doc.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                    {new Date(doc.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-12 text-center opacity-40">
                        <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Locker is empty.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                                <h3 className="font-bold">Add to Locker</h3>
                                <button onClick={resetForm}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-4 space-y-4">
                                <Input label="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Shop License" />
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setNewType('text')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 ${newType === 'text' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 opacity-60'}`}
                                    >
                                        Text Note
                                    </button>
                                    <button 
                                        onClick={() => { setNewType('image'); fileInputRef.current?.click(); }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 ${newType === 'image' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 opacity-60'}`}
                                    >
                                        Upload Image
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
                                </div>

                                {newType === 'text' ? (
                                    <textarea 
                                        className="w-full h-32 p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-700 outline-none resize-none"
                                        placeholder="Type content here..."
                                        value={newContent}
                                        onChange={e => setNewContent(e.target.value)}
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                                        {newContent ? (
                                            <img src={newContent} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="text-center opacity-50">
                                                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                                <div className="text-xs">No Image Selected</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Button onClick={handleSave} className="w-full" disabled={!newTitle || !newContent}>Save Document</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewDoc && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
                        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{previewDoc.title}</h3>
                                    <p className="text-xs opacity-50">{new Date(previewDoc.date).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => deleteDoc(previewDoc.id)} className="p-2 text-red-500 bg-red-50 rounded-full hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
                                    <button onClick={() => setPreviewDoc(null)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div className="p-0 max-h-[70vh] overflow-auto bg-gray-100 dark:bg-black">
                                {previewDoc.type === 'image' ? (
                                    <img src={previewDoc.content} className="w-full h-auto" />
                                ) : (
                                    <div className="p-6 whitespace-pre-wrap font-mono text-sm leading-relaxed">{previewDoc.content}</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Documents;
