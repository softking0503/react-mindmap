'use client'
import { useEffect, useState } from 'react';
import useMindMapStore from '@/stores/mapStore';
import { Input, Select, Button } from 'antd';


const { Option } = Select;

export default function OptionGroup() {
    const [projectName, setProjectName] = useState<string>('');
    const [projectNames, setProjectNames] = useState<string[]>([]);
    const { createNewProject, getProjects, setCurrentProject, initializeMindMap, setMindMapProjectName, deleteMindMapProject, downloadFreemind, downloadProject, loadProject, loadFreeMind } = useMindMapStore();

    const handleChange = (value: string) => {
        console.log(value);

        setCurrentProject(value);
    }

    const handleCreateNew = () => {
        createNewProject(projectName);
        setProjectName(''); // Clear the input after creating a new project
        updateProjectNames(); // Update the project names list
    }

    const updateProjectNames = () => {
        const projectNames = getProjects();
        if (projectName.length == 0) {
            initializeMindMap()
            const projects = getProjects();
            setProjectNames(projects)
        }
        else {
            setProjectNames(projectNames);
        }
    }

    const handleChangeProjectName = () => {
        setMindMapProjectName(projectName);
    }

    useEffect(() => {
        updateProjectNames();
        window.addEventListener('projectChanged', updateProjectNames);

        return () => {
            window.removeEventListener('projectChanged', updateProjectNames);
        };
    }, []);

    return (
        <>
            <div className='flex justify-between items-center w-full'>
                <div className='flex flex-col gap-2.5'>
                    <div className='flex gap-3.75 items-center'>
                        <Select
                            defaultValue="Select Project Name"
                            style={{ width: 300, height: 35 }}
                            onChange={handleChange}
                        >
                            {projectNames.map((name, index) => (
                                <Option key={index} value={name}>
                                    {name}
                                </Option>
                            ))}
                        </Select>
                        <Button type='primary' onClick={handleCreateNew}>
                            Create New
                        </Button>
                    </div>
                    <div>
                        <Input
                            placeholder="MindMap name"
                            value={projectName}
                            onChange={(e) => {
                                setProjectName(e.target.value);
                                console.log(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <div className='flex gap-[10px] items-center'>
                    <Button type='primary' style={{ width: 120 }} onClick={handleChangeProjectName}>
                        Save
                    </Button>
                    <Button type='primary' danger style={{ color: "#fff", width: 120 }} onClick={deleteMindMapProject}>
                        Delete
                    </Button>
                </div>
                <div className='flex flex-col gap-[10px]'>
                    <div className='flex gap-5'>
                        <Button type='primary' style={{ width: 200 }} onClick={loadFreeMind}>
                            Load Freemind
                        </Button>
                        <Button type='primary' style={{ width: 200 }} onClick={downloadFreemind}>
                            Download Freemind
                        </Button>
                    </div>
                    <div className='flex gap-5'>
                        <Button type='primary' style={{ width: 200 }} onClick={loadProject}>
                            Load Project
                        </Button>
                        <Button type='primary' style={{ width: 200 }} onClick={downloadProject}>
                            Download Project
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
