// components/CommandSidebar.tsx

import { message } from 'antd';
import React, { useEffect, useState, DragEvent } from 'react';
import useMindMapStore from '@/stores/mapStore';
import { Commands } from '@/stores/mapStore';

const CommandSidebar: React.FC = () => {
    const { getCommands } = useMindMapStore()

    const [storedData, setStoredData] = useState<Commands[]>([]);

    const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string, commandName: string, CommandType: string) => {
        if (CommandType === "Node type") {
            message.error({
                content: "Select Command Type"
            });
            event.preventDefault(); // Prevent the drag event if CommandType is invalid
            return;
        }

        if (CommandType === "Edit Node") {
            message.error({
                content: "Select Command Type"
            });
            event.preventDefault(); // Prevent the drag event if CommandType is invalid
            return;
        }

        if (CommandType === "") {
            message.error({
                content: "Select Command Type"
            });
            event.preventDefault(); // Prevent the drag event if CommandType is invalid
            return;
        }

        const data = JSON.stringify({
            type: nodeType,
            commandName: commandName,
            CommandType: CommandType
        });
        event.dataTransfer.setData('application/reactflow', data);
        event.dataTransfer.effectAllowed = 'move';
    };

    const fetchData = () => {
        const storeData = getCommands();

        if (storeData) {
            setStoredData(storeData);
        } else {
            setStoredData([]);
        }
    }

    useEffect(() => {
        fetchData();

        window.addEventListener('projectChanged', fetchData);

        return () => {
            window.removeEventListener('projectChanged', fetchData);
        };
    }, [])

    return (
        <div className="p-[15px] border-[1px] border-solid border-black bg-white flex flex-col gap-[15px] overflow-h-scroll max-h-[280px]">
            {storedData.map((item, index) => (
                <div
                    key={index}
                    className="w-full h-[50px] border-[1px] border-solid border-black flex items-center justify-between px-[10px] border-t-[0px]]"
                    onDragStart={(event) => onDragStart(event, 'topicNode', item.commandName, item.select)}
                    draggable
                >
                    <h1>{item.commandName}</h1>
                    <h1>{item.commandShortcut}</h1>
                </div>
            ))}
        </div>
    );
};

export default CommandSidebar;
