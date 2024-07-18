'use client'
import { Button, Input } from "antd";
import Command from "./Command/Command";
import useMindMapStore from "@/stores/mapStore";
import { useEffect, useState } from "react";
import { Commands } from "@/stores/mapStore"
import { Reorder } from 'framer-motion';


export default function CommandsGroup() {
    const [openAIKey, setOpenAIKey] = useState<string>('')
    const [defaultAssistantId, setDefaultAssistantId] = useState<string>('')
    const [defaultThreadId, setDefaultThreadId] = useState<string>('')
    const [isClient, setIsClient] = useState<boolean>(false)

    const [commands, setCommands] = useState<Commands[]>([]);

    const [edit, setEdit] = useState<boolean>(false);


    const { saveConfigurationDefaultValue, getDatas, addCommand, saveCommandReorder } = useMindMapStore()

    const deleteComponent = (index: Number) => {
        console.log(index);
        setCommands((prevComponents) => prevComponents.filter((_, i) => i !== index));
    }


    const fetchData = () => {
        const data = getDatas()

        if (data) {
            setOpenAIKey(data[0].configuration.openAIKey);
            setDefaultAssistantId(data[0].configuration.defaultAssistantId);
            setDefaultThreadId(data[0].configuration.defaultThreadId);
            setCommands(data[0].configuration.commands)
        }
    }

    const handleEdit = (id: number) => {
        setEdit(true);
        console.log(`Edit button clicked for component with id: ${id}`);
    };

    const handleApply = (id: number) => {
        setEdit(false);
    }

    useEffect(() => {
        if (isClient) {
            saveConfigurationDefaultValue(openAIKey, defaultAssistantId, defaultThreadId)
        }

        fetchData()

        window.addEventListener('projectChanged', fetchData);

        return () => {
            window.removeEventListener('projectChanged', fetchData);
        };
    }, [openAIKey, defaultAssistantId, defaultThreadId])

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
                    />
                </div>
                <div className="w-[400px] flex justify-between items-center">
                    <h1>Default Assistant Id</h1>
                    <Input
                        placeholder="Input"
                        className='w-[230px]'
                        value={defaultAssistantId}
                        onChange={(e) => { setDefaultAssistantId(e.target.value); setIsClient(true) }}
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
                    <div>
                        {commands.map((item, index) => (
                            <Command key={index} id={index} onDelete={deleteComponent} onEdit={handleEdit} onApply={handleApply} />
                        ))}
                    </div>
                    :
                    <Reorder.Group axis="y" values={commands} onReorder={(value) => { saveCommandReorder(value); setCommands(value) }}>
                        {commands.map((item, index) => (
                            <Reorder.Item key={item.commandKey} value={item}>
                                <div>
                                    <Command key={index} id={index} onDelete={deleteComponent} onEdit={handleEdit} onApply={handleApply} />
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
            }
            <div>
                <Button type="primary" onClick={addCommand}>
                    Create Command
                </Button>
            </div>
        </div>
    )
}
