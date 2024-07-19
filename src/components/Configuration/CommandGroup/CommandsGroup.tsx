'use client'
import { Button, Input } from "antd";
import Command from "./Command/Command";
import useMindMapStore from "@/stores/mapStore";
import { useEffect, useState } from "react";
import { Commands } from "@/stores/mapStore";
import { Reorder } from 'framer-motion';
import axios from "axios";

export default function CommandsGroup() {
    const [openAIKey, setOpenAIKey] = useState<string>('');
    const [defaultAssistantId, setDefaultAssistantId] = useState<string>('');
    const [defaultThreadId, setDefaultThreadId] = useState<string>('');
    const [isClient, setIsClient] = useState<boolean>(false);

    const [commands, setCommands] = useState<Commands[]>([]);

    const [editingCommandId, setEditingCommandId] = useState<number | null>(null);
    const [edit, setEdit] = useState<boolean>(true)

    const { saveConfigurationDefaultValue, getDatas, addCommand, saveCommandReorder, getDefaultThreadId, getOpenAIKey, getDefaultAssistantId } = useMindMapStore();

    const deleteComponent = (index: number) => {
        console.log(index);
        setCommands((prevComponents) => prevComponents.filter((_, i) => i !== index));
    };

    const fetchData = () => {
        const data = getDatas();

        if (data) {
            setOpenAIKey(data[0].configuration.openAIKey);
            setDefaultAssistantId(data[0].configuration.defaultAssistantId);
            setDefaultThreadId(data[0].configuration.defaultThreadId);
            setCommands(data[0].configuration.commands);
        }
    };

    const handleEdit = (id: number) => {
        setEditingCommandId(id);
        setEdit(false)
        console.log(`Edit button clicked for component with id: ${id}`);
    };

    const handleApply = (id: number) => {
        setEditingCommandId(null);
        setEdit(true)
    };

    const createThreadID = async () => {
        try {
            const openAIKey = getOpenAIKey()
            const assistantId = getDefaultAssistantId()

            const response = await axios.post('/api/openai', {
                name: "Math Tutor",
                instructions: "You are a personal math tutor. Write and run code to answer math questions.",
                model: "gpt-4o",
                openAIKey: openAIKey,
                defaultAssistantId: assistantId
            });
            console.log(response.data.id);
            return response.data.id;
        } catch (error) {
            console.error('Error creating assistant:', error);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            if (isClient) {
                saveConfigurationDefaultValue(openAIKey, defaultAssistantId, defaultThreadId);
            }


            if (!isClient) {
                fetchData();
            }


            window.addEventListener('projectChanged', fetchData);

            return () => {
                window.removeEventListener('projectChanged', fetchData);
            };
        };

        initialize();
    }, [openAIKey, defaultAssistantId, defaultThreadId]);

    const setThreadID = async () => {
        const defaultThreadIdValue = getDefaultThreadId()
        if (defaultThreadIdValue === '') {
            const threadId = await createThreadID();
            if (threadId) {
                setDefaultThreadId(threadId);
                setIsClient(true)
            }
        }
    };

    useEffect(() => {
        setThreadID();
    }, [])

    const handleAddCommand = () => {
        addCommand();
        const newCommandIndex = commands.length; // The new command will be the last one in the array
        setEditingCommandId(newCommandIndex);
        setEdit(false);
        setIsClient(true);
    };

    return (
        <div className="w-full flex flex-col gap-[30px]">
            <div className='flex flex-col gap-[20px]'>
                <div className="w-[400px] flex justify-between items-center">
                    <h1>OPENAI KEY</h1>
                    <Input
                        placeholder="Input"
                        className='w-[230px]'
                        value={openAIKey}
                        onChange={(e) => { setOpenAIKey(e.target.value); setIsClient(true) }}
                        onPressEnter={setThreadID}
                    />
                </div>
                <div className="w-[400px] flex justify-between items-center">
                    <h1>Default Assistant Id</h1>
                    <Input
                        placeholder="Input"
                        className='w-[230px]'
                        value={defaultAssistantId}
                        onChange={(e) => { setDefaultAssistantId(e.target.value); setIsClient(true) }}
                        onPressEnter={setThreadID}
                    />
                </div>
                <div className="w-[400px] flex justify-between items-center">
                    <h1>Default Thread Id</h1>
                    <Input
                        placeholder="Input"
                        className='w-[230px]'
                        value={defaultThreadId}
                        onChange={(e) => { setDefaultThreadId(e.target.value); setIsClient(true) }}
                    />
                </div>
            </div>
            {
                edit ?
                    <Reorder.Group axis="y" values={commands} onReorder={(value) => { saveCommandReorder(value); setCommands(value) }}>
                        {commands.map((item, index) => (
                            <Reorder.Item key={item.commandKey} value={item}>
                                <div>
                                    <Command key={index} id={index} onDelete={deleteComponent} onEdit={handleEdit} onApply={handleApply} isEditing={editingCommandId != index} />
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                    :
                    <div>
                        {commands.map((item, index) => (
                            <Command key={index} id={index} onDelete={deleteComponent} onEdit={handleEdit} onApply={handleApply} isEditing={editingCommandId != index} />
                        ))}
                    </div>
            }
            <div>
                <Button type="primary" onClick={handleAddCommand}>
                    Create Command
                </Button>
            </div>
        </div>
    );
}
