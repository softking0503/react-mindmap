'use client';

import { useEffect, useRef, useState } from 'react';
import useMindMapStore from '@/stores/mapStore';
import 'jsmind/style/jsmind.css';
import CommandSidebar from './CommandSidebar/CommandSidebar';
import { MinusCircleOutlined, FullscreenOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { mindMap, Commands } from '@/stores/mapStore';
import { message, Modal, Input } from 'antd';

const MindMap = () => {
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
    const jmRef = useRef<any>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [showCommandBar, setShowCommandBar] = useState<boolean>(true);
    const [commands, setCommands] = useState<Commands[]>([]);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [currentNode, setCurrentNode] = useState<any>(null);
    const [editedContent, setEditedContent] = useState<string>('');
    const { currentMind, addNode, deleteNode, initializeMindMap, getCommands, updateNodeContent } = useMindMapStore();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        initializeMindMap();
    }, [isClient]);

    useEffect(() => {
        if (!isClient || !currentMind) return;

        const loadMindMapInstance = async () => {
            const { default: jsMind } = await import('jsmind');
            const options = {
                container: 'jsmind_container',
                editable: true,
                theme: 'primary',
                layout: {
                    hspace: 30,
                    vspace: 20,
                    pspace: 13,
                    direction: 'right',
                },
            };
            if (!jmRef.current) {
                const jm = new jsMind(options);
                jm.show(currentMind);
                jmRef.current = jm;
            } else {
                jmRef.current.show(currentMind);
            }

            applyNodeBackgroundColors(currentMind);

            document.getElementById('jsmind_container')?.addEventListener('contextmenu', handleContextMenu);
            document.getElementById('jsmind_container')?.addEventListener('dblclick', handleNodeDoubleClick);
            document.addEventListener('click', handleClickOutside);
        };

        const fetchData = () => {
            const mindData = getCommands();
            if (mindData) {
                setCommands(mindData);
            }
        };

        loadMindMapInstance();
        fetchData();

        return () => {
            document.getElementById('jsmind_container')?.removeEventListener('contextmenu', handleContextMenu);
            document.getElementById('jsmind_container')?.removeEventListener('dblclick', handleNodeDoubleClick);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isClient, currentMind]);

    const applyNodeBackgroundColors = (mindMapData: mindMap) => {
        mindMapData.data.forEach(node => {
            switch (node.type) {
                case 'Idea':
                    jmRef.current.set_node_color(node.id, 'Green', 'black');
                    break;
                case 'Context':
                    jmRef.current.set_node_color(node.id, 'Gray', 'black');
                    break;
                case 'Content':
                    jmRef.current.set_node_color(node.id, 'White', 'black');
                    break;
                default:
                    jmRef.current.set_node_color(node.id, '#3276b1', 'black');
            }
        });
    };

    const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        const selectedNode = jmRef.current?.get_selected_node();
        if (!selectedNode) return;

        setContextMenu({
            visible: true,
            x: event.clientX + 5,
            y: event.clientY + 5,
        });
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
            setContextMenu({ visible: false, x: 0, y: 0 });
        }
    };

    const handleNodeDoubleClick = (event: MouseEvent) => {
        const selectedNode = jmRef.current?.get_selected_node();
        if (!selectedNode) return;

        setCurrentNode(selectedNode);
        setEditedContent(selectedNode.topic);
        setEditModalVisible(true);
    };

    const handleAddNode = (nodeType: string) => {
        const selectedNode = jmRef.current?.get_selected_node();
        if (!selectedNode) {
            alert('Please select a node to add a child.');
            return;
        }

        if (!nodeType || nodeType === '' || nodeType === 'Node type') {
            message.error({
                content: "Please select command type"
            });
            setContextMenu({ visible: false, x: 0, y: 0 });
            return;
        }

        const nodeId = `${nodeType.toUpperCase()}_#${new Date().getTime()}`;
        const newNode = { id: nodeId, parentid: selectedNode.id, topic: `sub_${nodeType}`, isroot: false, type: nodeType };

        jmRef.current?.add_node(selectedNode, nodeId, nodeId, { direction: 'right' });
        addNode(selectedNode.id, newNode);
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const handleDeleteNode = () => {
        const selectedNode = jmRef.current?.get_selected_node();
        if (!selectedNode || selectedNode.isroot) {
            alert('Please select a non-root node to delete.');
            return;
        }

        message.success({
            content: `Delete ${selectedNode.data.type} node`
        });
        deleteNode(selectedNode.id);
        jmRef.current?.remove_node(selectedNode.id);
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const handleEditSave = () => {
        if (currentNode && editedContent) {
            currentNode.topic = editedContent;
            jmRef.current.update_node(currentNode.id, editedContent);
            console.log(currentNode.id, editedContent);
            updateNodeContent(currentNode.id, editedContent)
            setEditModalVisible(false);
        }
    };

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
    };

    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (!reactFlowWrapper.current) return;

        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        if (event.dataTransfer) {
            const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));

            const position = {
                x: event.clientX - left,
                y: event.clientY - top,
            };

            if (!data.type) return;

            addNode("root", { id: `sub${new Date().getTime()}`, parentid: "root", topic: `sub${new Date().getTime()}`, isroot: false, type: data.CommandType });
        }
    };

    if (!isClient) return null;

    return (
        <div>
            <div className="w-full h-full bg-slate-100" ref={reactFlowWrapper} onDragOver={onDragOver} onDrop={onDrop}>
                <div id="jsmind_container" style={{ width: '100%', height: '700px', backgroundColor: '#f4f4f4' }}></div>
            </div>
            {contextMenu.visible && (
                <div
                    ref={contextMenuRef}
                    className="context-menu"
                    style={{
                        position: 'absolute',
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '5px',
                        zIndex: 10,
                    }}
                >
                    <ul>
                        <li onClick={() => handleAddNode("Idea")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                            Add Idea Node
                        </li>
                        <li onClick={() => handleAddNode("Context")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                            Add Context Node
                        </li>
                        <li onClick={() => handleAddNode("Content")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                            Add Content Node
                        </li>
                        <li onClick={handleDeleteNode} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                            Delete Node
                        </li>
                        {commands.map((value, index) => (
                            <li key={index} onClick={() => handleAddNode(value.select)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                {`Add ${value.commandName} node`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="absolute left-30 top-[300px] w-[280px] z-10">
                <div className="border-[1px] border-[solid] border-black h-[40px] w-full relative flex justify-center items-center bg-white">
                    <h1>Command Bar</h1>
                    <div className="absolute right-0 top-0 w-[75px] h-full flex justify-between items-center px-[15px]">
                        {showCommandBar ? (
                            <MinusCircleOutlined onClick={() => setShowCommandBar(false)} />
                        ) : (
                            <PlusCircleOutlined onClick={() => setShowCommandBar(true)} />
                        )}
                        <FullscreenOutlined />
                    </div>
                </div>
                {showCommandBar && <CommandSidebar />}
            </div>
            <Modal
                title="Edit Node Content"
                open={editModalVisible}
                onOk={handleEditSave}
                onCancel={() => setEditModalVisible(false)}
                keyboard={true}
            >
                <Input value={editedContent} onPressEnter={() => { handleEditSave(); setEditModalVisible(false) }} onChange={(e) => setEditedContent(e.target.value)} />
            </Modal>
        </div>
    );
};

export default MindMap;
