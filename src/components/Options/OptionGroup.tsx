"use client";
import { useEffect, useState } from "react";
import useMindMapStore from "@/stores/mapStore";
import { Input, Select, Button } from "antd";

const { Option } = Select;

export default function OptionGroup() {
  const [projectName, setProjectName] = useState<string>("");
  const [defaultProjectName, setDefaultProjectName] = useState<string>("");
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const {
    createNewProject,
    getProjects,
    setCurrentProject,
    initializeMindMap,
    setMindMapProjectName,
    deleteMindMapProject,
    downloadFreemind,
    downloadProject,
    loadProject,
    loadFreeMind,
    getDatas,
  } = useMindMapStore();

  const handleChange = (value: string) => {
    setCurrentProject(value);
  };

  const handleCreateNew = () => {
    createNewProject(projectName);
    setProjectName(""); // Clear the input after creating a new project
    updateProjectNames(); // Update the project names list
  };

  const updateProjectNames = () => {
    const projectNames = getProjects();
    if (projectName.length == 0) {
      initializeMindMap();
      const projects = getProjects();
      setProjectNames(projects);
    } else {
      setProjectNames(projectNames);
    }
  };

  const handleChangeProjectName = () => {
    setMindMapProjectName(projectName);
  };

  const getProjectName = () => {
    const mindMapData = getDatas();

    if (mindMapData) {
      setDefaultProjectName(mindMapData[0].projectName);
    }
  };

  useEffect(() => {
    updateProjectNames();
    getProjectName();

    window.addEventListener("projectChanged", updateProjectNames);
    window.addEventListener("projectChanged", getProjectName);

    return () => {
      window.removeEventListener("projectChanged", updateProjectNames);
      window.removeEventListener("projectChanged", getProjectName);
    };
  }, []);

  return (
    <>
      <div className="flex justify-between items-center w-full max-[1365px]:flex-col">
        <div className="flex flex-col gap-2.5 p-[20px] max-[1365px]:w-full max-[500px]:px-0">
          <div className="flex gap-3.75 items-center justify-between max-[630px]:flex-col max-[630px]:gap-[10px]">
            <Select
              value={defaultProjectName}
              style={{ height: 35 }}
              onChange={handleChange}
              className="grow w-[300px] max-[630px]:w-full"
            >
              {projectNames.map((name, index) => (
                <Option key={index} value={name}>
                  {name}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              onClick={handleCreateNew}
              className="max-[630px]:w-full"
            >
              Create New
            </Button>
          </div>
          <div>
            <Input
              placeholder="MindMap name"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex gap-[10px] items-center p-[20px] max-[1365px]:w-full justify-between max-[630px]:flex-col max-[630px]:w-full max-[500px]:px-0">
          <Button
            type="primary"
            onClick={handleChangeProjectName}
            className="grow w-[120px] max-[630px]:w-full"
          >
            Save
          </Button>
          <Button
            type="primary"
            danger
            style={{ color: "#fff" }}
            onClick={deleteMindMapProject}
            className="grow w-[120px] max-[630px]:w-full"
          >
            Delete
          </Button>
        </div>
        <div className="flex flex-col gap-[10px] p-[20px] max-[1365px]:w-full max-[630px]:gap-3 max-[500px]:px-0">
          <div className="flex gap-5 justify-between max-[630px]:flex-col max-[630px]:gap-3">
            <Button
              type="primary"
              onClick={loadFreeMind}
              className="grow w-[200px] max-[630px]:w-full"
            >
              Load Freemind
            </Button>
            <Button
              type="primary"
              onClick={downloadFreemind}
              className="grow w-[200px] max-[630px]:w-full"
            >
              Download Freemind
            </Button>
          </div>
          <div className="flex gap-5 justify-between max-[630px]:flex-col max-[630px]:gap-3">
            <Button
              type="primary"
              onClick={loadProject}
              className="grow w-[200px] max-[630px]:w-full"
            >
              Load Project
            </Button>
            <Button
              type="primary"
              onClick={downloadProject}
              className="grow w-[200px] max-[630px]:w-full"
            >
              Download Project
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
