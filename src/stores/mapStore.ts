import { message } from 'antd';
import { create } from 'zustand';

export interface Node {
    id: string;
    parentid?: string;
    isroot?: boolean;
    topic: string;
    type: string;
}

export interface checkState {
    context: boolean;
    content: boolean;
    idea: boolean
}

export interface Commands {
    commandName: string;
    commandShortcut: string;
    assistantId: string;
    threadId: string;
    commands: string;
    select: string;
    brothers: checkState;
    parent: checkState;
    all: checkState
}

export interface ReturnCommand {
    commandName: string;
    commandShortcut: string;
    assistantId: string;
    threadId: string;
    commands: string;
    select: string;
    ideas: string[];
    context: string[];
    content: string[];
};

export interface configuration {
    openAIKey: string;
    defaultAssistantId: string;
    defaultThreadId: string
    commands: Commands[]
}

export interface mindMap {
    meta: {
        name: string;
        author: string;
        version: string;
    };
    format: string;
    projectName: string;
    RequestInstruction: string;
    data: Node[];
    configuration: configuration
}

// Assuming loadFromJSON is imported from '@/utils/data'
import { loadFromJSON, loadFromMM, restoreData } from '@/utils/data';

const defaultReturnCommand: ReturnCommand = {
    commandName: '',
    commandShortcut: '',
    assistantId: '',
    threadId: '',
    commands: '',
    select: '',
    ideas: [],
    context: [],
    content: []
};

interface MindMapState {
    minds: mindMap[];
    currentMind: mindMap | null;
    setMinds: (newMinds: mindMap[]) => void;
    addNode: (parentNodeId: string, newNode: Node) => void;
    deleteNode: (nodeId: string) => void;
    initializeMindMap: () => void;
    createNewProject: (projectName: string) => void;
    getProjects: () => string[];
    setCurrentProject: (projectName: string) => void;
    setMindMapProjectName: (projectName: string) => void;
    deleteMindMapProject: () => void;
    downloadFreemind: () => void;
    downloadProject: () => void;
    loadProject: () => Promise<boolean>;
    loadFreeMind: () => Promise<boolean>;
    setRequestContent: (value: string) => void;
    getDatas: () => mindMap[];
    saveConfigurationDefaultValue: (openAIKey: string, defaultAssistantId: string, defaultThreadId: string) => void;
    addCommand: () => void;
    deleteCommand: (index: number) => void;
    saveCommand: (
        commandName: string,
        commandShortcut: string,
        assistantId: string,
        threadId: string,
        select: string,
        ideas: Array<any>,
        context: Array<any>,
        content: Array<any>,
        commands: string,
        id: number
    ) => void;
    getCommand: (index: number) => ReturnCommand;
    getCommands: () => Commands[];
}

const defaultMindMap: mindMap = {
    meta: {
        name: 'MindMap',
        author: 'hizzgdev@163.com',
        version: '0.2',
    },
    format: 'node_array',
    projectName: 'Default Project',
    data: [{ id: 'root', isroot: true, topic: 'MindMap', type: "root" }],
    RequestInstruction: '',
    configuration: {
        openAIKey: "",
        defaultAssistantId: "",
        defaultThreadId: "",
        commands: []
    }
};

const useMindMapStore = create<MindMapState>((set) => ({
    minds: [],
    currentMind: null,
    setMinds: (newMinds) => {
        localStorage.setItem('mindMapData', JSON.stringify(newMinds));
        window.dispatchEvent(new Event('projectChanged'));
        set({ minds: newMinds });
    },
    addNode: (parentNodeId, newNode) => set((state) => {
        const mind = state.minds[0];
        const parentNodeExists = mind.data.some((node) => node.id === parentNodeId);

        if (parentNodeExists) {
            const updatedMind = {
                ...mind,
                data: [...mind.data, { ...newNode, parentid: parentNodeId }],
            };

            const updatedMinds = state.minds.map((m, index) =>
                index === 0 ? updatedMind : m
            );

            localStorage.setItem('mindMapData', JSON.stringify(updatedMinds));
            window.dispatchEvent(new Event('projectChanged'));
            return { minds: updatedMinds };
        } else {
            message.error('Parent node not found');
            return state;
        }
    }),
    deleteNode: (nodeId) => set((state) => {
        const deleteNodeAndChildren = (nodes: Node[], id: string): Node[] => {
            const childrenIds = nodes.filter((node) => node.parentid === id).map((node) => node.id);
            let filteredNodes = nodes.filter((node) => node.id !== id);
            childrenIds.forEach((childId) => {
                filteredNodes = deleteNodeAndChildren(filteredNodes, childId);
            });
            return filteredNodes;
        };

        const updatedMinds = state.minds.map((mind) => ({
            ...mind,
            data: deleteNodeAndChildren(mind.data, nodeId),
        }));
        localStorage.setItem('mindMapData', JSON.stringify(updatedMinds));
        window.dispatchEvent(new Event('projectChanged'));
        return { minds: updatedMinds };
    }),
    initializeMindMap: () => {
        const mindData = localStorage.getItem('mindMapData');

        if (!mindData || mindData.length === 2) {
            localStorage.setItem('mindMapData', JSON.stringify([defaultMindMap]));
            window.dispatchEvent(new Event('projectChanged'));
            set({ minds: [defaultMindMap], currentMind: defaultMindMap });
        } else {
            const parsedMinds = JSON.parse(mindData!);
            set({ minds: parsedMinds, currentMind: parsedMinds[0] });
        }
    },
    createNewProject: (projectName: string) => set((state) => {
        if (!projectName) {
            message.error('Please input project name');
            return { minds: state.minds };
        }

        const newMindMap = {
            ...defaultMindMap,
            projectName,
            data: [{ id: 'root', isroot: true, topic: 'New MindMap', type: "root" }],
        };
        const updatedMinds = [newMindMap, ...state.minds];
        localStorage.setItem('mindMapData', JSON.stringify(updatedMinds));
        window.dispatchEvent(new Event('projectChanged'));
        return { minds: updatedMinds, currentMind: newMindMap };
    }),
    getProjects: () => {
        const data = localStorage.getItem('mindMapData');
        if (data) {
            const parsedMinds = JSON.parse(data) as mindMap[];
            return parsedMinds.map((mind) => mind.projectName);
        }
        return [];
    },
    setCurrentProject: (projectName: string) => set((state) => {
        const selectedMind = state.minds.find((mind) => mind.projectName === projectName);
        if (selectedMind) {
            const updatedMinds = [selectedMind, ...state.minds.filter((mind) => mind.projectName !== projectName)];
            localStorage.setItem('mindMapData', JSON.stringify(updatedMinds));
            window.dispatchEvent(new Event('projectChanged'));
            return { minds: updatedMinds, currentMind: selectedMind };
        }
        return state;
    }),
    setMindMapProjectName: (projectName: string) => {
        const data = localStorage.getItem('mindMapData');
        if (data) {
            try {
                const parsedMinds = JSON.parse(data) as mindMap[];
                let count = 0;
                for (let i = 0; i < parsedMinds.length; i++) {
                    if (parsedMinds[i].projectName == projectName) {
                        count++;
                    }
                }
                if (count > 0) {
                    message.error({
                        content: "Duplicate Project Name"
                    })
                    return
                }
                if (parsedMinds.length > 0) {
                    parsedMinds[0].projectName = projectName;
                    localStorage.setItem('mindMapData', JSON.stringify(parsedMinds));
                    window.dispatchEvent(new Event('projectChanged'));
                }
            } catch (error) {
                console.error('Failed to parse mind map data:', error);
            }
        }
    },
    deleteMindMapProject: () => {
        const data = localStorage.getItem('mindMapData');

        if (data) {
            try {
                const parsedMinds = JSON.parse(data) as mindMap[];
                if (parsedMinds.length > 0) {
                    parsedMinds.shift();
                    localStorage.setItem('mindMapData', JSON.stringify(parsedMinds));
                    window.dispatchEvent(new Event('projectChanged'));
                }
            } catch (error) {
                console.error('Failed to parse mind map data:', error);
            }
        }
    },
    downloadFreemind: () => {
        const data = localStorage.getItem('mindMapData');
        if (data) {
            try {
                const parsedMinds = JSON.parse(data) as mindMap[];
                const mindMapToDownload = parsedMinds[0].data; // Assuming you want to download the first mind map

                const blob = new Blob([JSON.stringify(mindMapToDownload)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `New project.mm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (error) {
                console.error('Failed to parse mind map data:', error);
            }
        }
    },
    downloadProject: () => {
        const data = localStorage.getItem('mindMapData');
        if (data) {
            try {
                const parsedMinds = JSON.parse(data) as mindMap[];
                const mindMapToDownload = parsedMinds[0]; // Assuming you want to download the first mind map

                const blob = new Blob([JSON.stringify(mindMapToDownload)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${mindMapToDownload.projectName}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (error) {
                console.error('Failed to parse mind map data:', error);
            }
        }
    },
    loadProject: async () => {
        try {
            const data = await loadFromJSON(); // Assuming loadFromJSON returns the loaded data as MindMap

            restoreData(data)
        } catch (error) {
            console.error('Failed to load Freemind data:', error);
        }

        return false;
    },
    loadFreeMind: async () => {
        try {
            const data = await loadFromMM(); // Assuming loadFromMM returns an array of Node or MindMap

            const storageData = localStorage.getItem('mindMapData');
            if (storageData) {
                const mindData = JSON.parse(storageData) as mindMap[];

                let initMindMapData: mindMap = {
                    meta: {
                        name: 'MindMap',
                        author: 'hizzgdev@163.com',
                        version: '0.2',
                    },
                    format: 'node_array',
                    projectName: `New Freemind${new Date().getTime()}`,
                    data: [],
                    RequestInstruction: '',
                    configuration: {
                        openAIKey: "",
                        defaultAssistantId: "",
                        defaultThreadId: "",
                        commands: []
                    }
                };

                console.log(data);

                initMindMapData.data = [
                    ...initMindMapData.data,
                    ...data
                ]


                mindData.unshift(initMindMapData); // Adding initMindMapData to the beginning of mindData
                localStorage.setItem('mindMapData', JSON.stringify(mindData));
                window.dispatchEvent(new Event('projectChanged'));

                return true;
            }
        } catch (error) {
            console.error(error);
        }
        return false;
    },
    setRequestContent: (value: string) => {
        const data = localStorage.getItem("mindMapData");
        if (data) {
            const mindData = JSON.parse(data);

            mindData[0].RequestInstruction = value;

            localStorage.setItem("mindMapData", JSON.stringify(mindData));
        }
    },
    getDatas: () => {
        const data = localStorage.getItem("mindMapData");
        if (data) {
            return JSON.parse(data)
        }
        else {
            return [];
        }
    },
    saveConfigurationDefaultValue: (openAIKey: string, defaultAssistantId: string, defaultThreadId: string) => {
        const data = localStorage.getItem("mindMapData");
        if (data) {
            const mindData = JSON.parse(data);

            mindData[0].configuration.openAIKey = openAIKey;
            mindData[0].configuration.defaultAssistantId = defaultAssistantId;
            mindData[0].configuration.defaultThreadId = defaultThreadId;

            localStorage.setItem("mindMapData", JSON.stringify(mindData));
            window.dispatchEvent(new Event('projectChanged'));
        }
    },
    addCommand: () => {
        let brother: checkState = {
            idea: false,
            context: false,
            content: false
        };

        let parent: checkState = {
            idea: false,
            context: false,
            content: false
        };

        let all: checkState = {
            idea: false,
            context: false,
            content: false
        };
        const command: Commands = {
            commandName: '',
            commandShortcut: '',
            assistantId: '',
            threadId: '',
            select: '',
            parent: parent,
            brothers: brother,
            all: all,
            commands: '',
        };

        const storageData = localStorage.getItem("mindMapData");

        if (storageData) {
            const data = JSON.parse(storageData)
            data[0].configuration.commands.push(command);
            localStorage.setItem("mindMapData", JSON.stringify(data));
            window.dispatchEvent(new Event('projectChanged'));
        }
    },
    deleteCommand: (index: number) => {
        const storageData = localStorage.getItem("mindMapData");
        if (storageData) {
            const data = JSON.parse(storageData)
            if (data.length > 0) {
                data[0].configuration.commands.splice(index, 1);
                localStorage.setItem('mindMapData', JSON.stringify(data));
                window.dispatchEvent(new Event('projectChanged'));
            }
        }
    },
    saveCommand: (
        commandName: string,
        commandShortcut: string,
        assistantId: string,
        threadId: string,
        select: string,
        ideas: Array<any>,
        context: Array<any>,
        content: Array<any>,
        commands: string,
        id: number
    ) => {
        const storageData = localStorage.getItem("mindMapData");
        if (storageData) {
            const data = JSON.parse(storageData)
            let brother: checkState = {
                idea: false,
                context: false,
                content: false
            };

            let parent: checkState = {
                idea: false,
                context: false,
                content: false
            };

            let all: checkState = {
                idea: false,
                context: false,
                content: false
            };

            if (ideas.includes("Brother")) {
                brother.idea = true;
            }

            if (ideas.includes("Parent")) {
                parent.idea = true
                if (ideas.includes("Brother")) {
                    all.idea = true
                }
            }




            if (context.includes("Brother")) {
                brother.context = true;
            }

            if (context.includes("Parent")) {
                parent.context = true
                if (context.includes("Brother")) {
                    all.context = true
                }
            }




            if (content.includes("Brother")) {
                brother.content = true;
            }

            if (content.includes("Parent")) {
                parent.content = true
                if (content.includes("Brother")) {
                    all.content = true
                }
            }


            const command: Commands = {
                commandName,
                commandShortcut,
                assistantId,
                threadId,
                select,
                parent: parent,
                brothers: brother,
                all: all,
                commands,
            };

            data[0].configuration.commands[id] = command;
            localStorage.setItem('mindMapData', JSON.stringify(data));
            window.dispatchEvent(new Event('projectChanged'));
        }
    },
    getCommand: (index: number) => {
        const mindMapData = localStorage.getItem("mindMapData");

        if (mindMapData) {
            const data = JSON.parse(mindMapData);

            let commandData: Commands;

            commandData = data[0].configuration.commands[index];

            let idea: string[] = ['Brother', 'Parent']
            let context: string[] = ['Brother', 'Parent']
            let content: string[] = ['Brother', 'Parent']

            if (commandData.brothers.idea === false) {
                idea.shift()
            }

            if (commandData.brothers.context === false) {
                context.shift()
            }

            if (commandData.brothers.content == false) {
                content.shift()
            }



            if (commandData.parent.idea === false) {
                idea.pop()
            }

            if (commandData.parent.context === false) {
                context.pop()
            }

            if (commandData.parent.content == false) {
                content.pop()
            }

            const command: ReturnCommand = {
                commandName: commandData.commandName,
                commandShortcut: commandData.commandShortcut,
                assistantId: commandData.assistantId,
                threadId: commandData.threadId,
                select: commandData.select,
                commands: commandData.commands,
                ideas: idea,
                context: context,
                content: content
            }


            return command;
        }
        return defaultReturnCommand
    },
    getCommands: () => {
        const mindMapData = localStorage.getItem("mindMapData");

        if (mindMapData) {
            const data = JSON.parse(mindMapData);

            return data[0].configuration.commands;
        }
    }
}));

export default useMindMapStore;
