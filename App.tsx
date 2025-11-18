import React, { useState, useEffect, useCallback } from 'react';
import { Node, NewNodeData } from './types';
import { getNodes, saveNodes, deleteNode } from './services/nodeService';
import NodeForm from './components/NodeForm';
import TreeView from './components/TreeView';
import { Github } from 'lucide-react';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);

  // Load nodes on page load
  useEffect(() => {
    const loadNodes = async () => {
      const loadedNodes = await getNodes();  // ✅ Wait for data to arrive
      setNodes(loadedNodes);
    };
    loadNodes();
  }, []);

  // Save nodes whenever they change
  useEffect(() => {
    if (nodes.length > 0) {
      saveNodes(nodes);  // ✅ Runs AFTER state updates
    }
  }, [nodes]);  // ← Runs every time nodes changes
//use effect for automaticstuff
   // ✅ CORRECT: Delete handler at component level with useCallback
  const handleDeleteNode = useCallback(async (id: string) => {
    if (!window.confirm(`Delete this node? This cannot be undone.`)) {
      return;
    }

    // Optimistic update: Remove from UI immediately
    setNodes(prevNodes => prevNodes.filter(node => node.id !== id));

    // Then delete from backend
    try {
      await deleteNode(id);
      console.log(`Node ${id} deleted successfully from backend`);
    } catch (error) {
      // If backend fails, restore from server
      console.error('Delete failed, reloading from server...', error);
      const loadedNodes = await getNodes();
      setNodes(loadedNodes);
      alert('Failed to delete node. List refreshed from server.');
    }
  }, []);  // ✅ Empty deps - doesn't depend on anything external
  const handleAddNode = useCallback((newNodeData: NewNodeData) => {
    const newNode: Node = {
      id: crypto.randomUUID(),
      ...newNodeData,
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
    // ✅ No saveNodes here! It's handled by the useEffect above
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-slate-800">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-700">Phased Node Tree Visualizer</h1>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 xl:w-1/4">
            <NodeForm allNodes={nodes} onAddNode={handleAddNode} />
          </div>
          <div className="lg:w-2/3 xl:w-3/4">
          <TreeView nodes={nodes} onDelete={handleDeleteNode} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;