import React, {
  useEffect,
  useState,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Button, Input, Select, Checkbox, message } from "antd";
import type { CheckboxProps } from "antd";
import { FullscreenOutlined } from "@ant-design/icons";
import useMindMapStore from "@/stores/mapStore";

const { Option } = Select;
const { TextArea } = Input;

import {
  ideas,
  defaultIdeasCheckedList,
  context,
  defaultContextCheckedList,
  content,
  defaultContentCheckedList,
} from "@/utils/data";
import { configuration } from "@/utils/type";

interface CommandProps {
  id: number;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onApply: (id: number) => void;
  isEditing: boolean;
  allShortcuts: string[];
  updateShortcuts: (shortcut: string, id: number) => void;
}

const defaultValue: string = "Node type";

export default function Command({
  id,
  onDelete,
  onEdit,
  onApply,
  isEditing,
  allShortcuts,
  updateShortcuts,
}: CommandProps) {
  const {
    deleteCommand,
    saveCommand,
    getCommand,
    getDefaultAssistantId,
    getConfiguration,
    getDefaultThreadId,
  } = useMindMapStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const [isClient, setIsClient] = useState(false);

  const [checkedIdeasList, setCheckedIdeasList] = useState<string[]>(
    defaultIdeasCheckedList
  );
  const [checkedContextList, setCheckedContextList] = useState<string[]>(
    defaultContextCheckedList
  );
  const [checkedContentList, setCheckedContentList] = useState<string[]>(
    defaultContentCheckedList
  );

  const [commandName, setCommandName] = useState("");
  const [commandShortcut, setCommandShortcut] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [threadId, setThreadId] = useState("");
  const [commandsContent, setCommandsContent] = useState("");

  const [isKeypress, setIsKeypress] = useState<boolean>(false);

  const checkIdeasAll = ideas.length === checkedIdeasList.length;
  const indeterminateIdeas =
    checkedIdeasList.length > 0 && checkedIdeasList.length < ideas.length;
  const checkContextAll = context.length === checkedContextList.length;
  const indeterminateContext =
    checkedContextList.length > 0 && checkedContextList.length < context.length;
  const checkContentAll = content.length === checkedContentList.length;
  const indeterminateContent =
    checkedContentList.length > 0 && checkedContentList.length < content.length;

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const customEvent = new CustomEvent("inputChangeEvent", {
      detail: { value },
    });
    window.dispatchEvent(customEvent);
  };

  const onCheckIdeasAllChange: CheckboxProps["onChange"] = (e) => {
    setCheckedIdeasList(e.target.checked ? ideas : []);
  };

  const onCheckContextAllChange: CheckboxProps["onChange"] = (e) => {
    setCheckedContextList(e.target.checked ? context : []);
  };

  const onCheckContentAllChange: CheckboxProps["onChange"] = (e) => {
    setCheckedContentList(e.target.checked ? content : []);
  };

  const handleChange = (value: string) => {
    setSelectedValue(value);
    setIsClient(true);
  };

  const setCommandThreadId = () => {
    const thread = getCommand(id);
    const configurationData = getConfiguration();

    const defaultThreadId = configurationData.defaultThreadId;

    if (thread.threadId === "") {
      setThreadId(defaultThreadId);
      saveCommand(
        commandName,
        commandShortcut,
        assistantId,
        defaultThreadId,
        selectedValue,
        checkedIdeasList,
        checkedContextList,
        checkedContentList,
        commandsContent,
        id
      );
    }
  };

  useEffect(() => {
    if (isClient) {
      saveCommand(
        commandName,
        commandShortcut,
        assistantId,
        threadId,
        selectedValue,
        checkedIdeasList,
        checkedContextList,
        checkedContentList,
        commandsContent,
        id
      );
    }
  }, [
    commandName,
    commandShortcut,
    assistantId,
    threadId,
    commandsContent,
    selectedValue,
    checkedIdeasList,
    checkedContextList,
    checkedContentList,
    isClient,
  ]);

  useEffect(() => {
    if (!isClient) {
      const storedRequest = getCommand(id);

      const assistantID = getDefaultAssistantId();
      const defaultThreadID = getDefaultThreadId();

      if (storedRequest) {
        setCheckedIdeasList(storedRequest.ideas || defaultIdeasCheckedList);
        setCheckedContextList(
          storedRequest.context || defaultContextCheckedList
        );
        setCheckedContentList(
          storedRequest.content || defaultContentCheckedList
        );
        setCommandName(storedRequest.commandName || "");
        setCommandShortcut(storedRequest.commandShortcut || "");
        setAssistantId(assistantID || "");
        setThreadId(defaultThreadID || "");
        setCommandsContent(storedRequest.commands || "");
        setSelectedValue(storedRequest.select || defaultValue);
      }
    }
  }, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    let newShortcut = "";

    const specialKeys = ["Shift", "Control", "Alt", "Meta"];

    if (!specialKeys.includes(event.key)) {
      if (event.altKey && event.key) {
        event.preventDefault();
        newShortcut = `Alt + ${event.key.toUpperCase()}`;
      } else if (event.ctrlKey && event.key) {
        event.preventDefault();
        newShortcut = `Ctrl + ${event.key.toUpperCase()}`;
      } else if (event.shiftKey && event.key) {
        event.preventDefault();
        newShortcut = `Shift + ${event.key.toUpperCase()}`;
      }

      if (newShortcut && !allShortcuts.includes(newShortcut)) {
        setCommandShortcut(newShortcut);
        updateShortcuts(newShortcut, id);
        saveCommand(
          commandName,
          newShortcut,
          assistantId,
          threadId,
          selectedValue,
          checkedIdeasList,
          checkedContextList,
          checkedContentList,
          commandsContent,
          id
        );
      } else if (newShortcut) {
        message.error("Shortcut already in use");
      }
    }
  };

  useEffect(() => {
    if (isKeypress) {
      window.addEventListener("keydown", handleKeyDown as EventListener);

      return () => {
        window.removeEventListener("keydown", handleKeyDown as EventListener);
      };
    }
  });

  useEffect(() => {
    const handleThreadIdUpdate = (event: Event) => {
      const configuration: configuration = getConfiguration();

      const customEvent = event as CustomEvent;
      const { key } = customEvent.detail;
      if (key === id) {
        setThreadId(configuration.defaultThreadId);
      }
    };

    window.addEventListener(
      "threadIdUpdated",
      handleThreadIdUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "threadIdUpdated",
        handleThreadIdUpdate as EventListener
      );
    };
  }, [id]);

  return (
    <div className="w-full border-[1px] border-solid border-black px-[70px] py-[25px] flex flex-col gap-[30px] bg-[#f5f5f5] relative mt-[40px]">
      <div className="absolute right-[10px] top-[10px]">
        <FullscreenOutlined className="text-[20px]" />
      </div>
      <div className="w-full flex justify-between gap-[80px]">
        <div className="w-[500px] flex justify-between">
          <div className="flex flex-col justify-between h-[250px] w-full">
            <div className="w-[full] flex justify-between items-center">
              <h1>Command Name</h1>
              <Input
                placeholder="Input"
                className="w-[300px]"
                value={commandName}
                disabled={isEditing}
                onChange={(e) => {
                  setCommandName(e.target.value);
                  setIsClient(true);
                  handleOnChange(e);
                  setIsKeypress(false);
                }}
                onClick={() => {
                  setIsKeypress(false);
                }}
              />
            </div>
            <div className="w-[full] flex justify-between items-center">
              <h1>Command Shortcut</h1>
              <Input
                placeholder="Input"
                className="w-[300px]"
                value={commandShortcut}
                disabled={isEditing}
                onClick={() => {
                  setIsKeypress(true);
                }}
                onChange={(e) => {
                  setCommandShortcut(e.target.value);
                  setIsClient(true);
                  handleOnChange(e);
                  setIsKeypress(true);
                }}
              />
            </div>
            <div className="w-[full] flex justify-between items-center">
              <h1>Assistant Id</h1>
              <Input
                placeholder="Input"
                className="w-[300px]"
                value={assistantId}
                disabled={isEditing}
                onChange={(e) => {
                  setAssistantId(e.target.value);
                  setIsClient(true);
                  handleOnChange(e);
                  setIsKeypress(false);
                }}
                onClick={() => {
                  setIsKeypress(false);
                }}
              />
            </div>
            <div className="w-[full] flex justify-between items-center">
              <h1>Thread Id</h1>
              <Input
                placeholder="Input"
                className="w-[300px]"
                value={threadId}
                disabled={isEditing}
                onChange={(e) => {
                  setThreadId(e.target.value);
                  setIsClient(true);
                  handleOnChange(e);
                  setIsKeypress(false);
                }}
                onClick={() => {
                  setIsKeypress(false);
                }}
              />
            </div>
          </div>
        </div>
        <div className="grow h-[250px] flex flex-col gap-[20px]">
          <Select
            className="w-[650px]"
            onChange={(value) => {
              handleChange(value);
              setIsClient(true);
            }}
            value={selectedValue}
            defaultValue={selectedValue}
            disabled={isEditing}
          >
            <Option value="Node type">Node type</Option>
            <Option value="Idea">Create Idea</Option>
            <Option value="Context">Create Context</Option>
            <Option value="Content">Create Content</Option>
            <Option value="Edit Node">Edit Node</Option>
          </Select>
          <div className="w-[650px] grow border-[#d9d9d9] border-black border-[1px] rounded-[5px] flex flex-col justify-between p-[30px]">
            <div className="w-full flex">
              <div className="w-[31%] flex items-center justify-center"></div>
              <div className="w-[23%] flex items-center justify-center">
                <h1>Brother</h1>
              </div>
              <div className="w-[23%] flex items.center justify-center">
                <h1>Parent</h1>
              </div>
              <div className="w-[23%] flex items.center justify-center">
                <h1>All</h1>
              </div>
            </div>
            <div className="w-full flex">
              <div className="w-[31%] flex items.center justify.center">
                <h1>Ideas</h1>
              </div>
              {ideas.map((option) => (
                <Checkbox
                  key={option}
                  value={option}
                  checked={checkedIdeasList.includes(option)}
                  onChange={() => {
                    const newList = checkedIdeasList.includes(option)
                      ? checkedIdeasList.filter((item) => item !== option)
                      : [...checkedIdeasList, option];
                    setCheckedIdeasList(newList);
                    setIsClient(true);
                  }}
                  className="w-[23%] flex justify-center items-center"
                  disabled={isEditing}
                />
              ))}
              <Checkbox
                indeterminate={indeterminateIdeas}
                onChange={onCheckIdeasAllChange}
                checked={checkIdeasAll}
                disabled={isEditing}
                className="w-[23%] flex justify-center items-center"
              />
            </div>
            <div className="w-full flex">
              <div className="w-[31%] flex items.center justify.center">
                <h1>Context</h1>
              </div>
              {context.map((option) => (
                <Checkbox
                  key={option}
                  value={option}
                  checked={checkedContextList.includes(option)}
                  onChange={() => {
                    const newList = checkedContextList.includes(option)
                      ? checkedContextList.filter((item) => item !== option)
                      : [...checkedContextList, option];
                    setCheckedContextList(newList);
                    setIsClient(true);
                  }}
                  disabled={isEditing}
                  className="w-[23%] flex justify-center items-center"
                />
              ))}
              <Checkbox
                indeterminate={indeterminateContext}
                disabled={isEditing}
                onChange={onCheckContextAllChange}
                checked={checkContextAll}
                className="w-[23%] flex justify-center items-center"
              />
            </div>
            <div className="w-full flex">
              <div className="w-[31%] flex items.center justify.center">
                <h1>Content</h1>
              </div>
              {content.map((option) => (
                <Checkbox
                  key={option}
                  value={option}
                  checked={checkedContentList.includes(option)}
                  onChange={() => {
                    const newList = checkedContentList.includes(option)
                      ? checkedContentList.filter((item) => item !== option)
                      : [...checkedContentList, option];
                    setCheckedContentList(newList);
                    setIsClient(true);
                  }}
                  disabled={isEditing}
                  className="w-[23%] flex justify-center items.center"
                />
              ))}
              <Checkbox
                indeterminate={indeterminateContent}
                disabled={isEditing}
                onChange={onCheckContentAllChange}
                checked={checkContentAll}
                className="w-[23%] flex justify-center items.center"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-[20px]">
        <h1>commands</h1>
        <TextArea
          autoSize={{ minRows: 6, maxRows: 10 }}
          className="w-full text-[15px] whitespace-pre-line"
          onChange={(e) => {
            setCommandsContent(e.target.value);
            setIsClient(true);
            setIsKeypress(false);
          }}
          value={commandsContent}
          disabled={isEditing}
          onClick={() => {
            setIsKeypress(false);
          }}
        />
      </div>
      <div className="w-full flex justify-end relative">
        {showModal && (
          <div className="absolute w-[220px] h-[150px] bg-[#ffffff] bottom-[20px] right-[50px] z-10 border-[1px] border-black border-solid rounded-[3px] px-[20px] py-[22px] flex flex-col justify-between">
            <h1 className="text-[18px]">
              You are going to
              <br />
              Delete a Command
            </h1>
            <div className="flex justify-between items-center">
              <Button
                style={{
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #000000",
                  width: "74px",
                }}
                onClick={() => {
                  onDelete(id);
                  deleteCommand(id);
                  setShowModal(false);
                }}
              >
                OK
              </Button>
              <Button
                style={{
                  backgroundColor: "#212121",
                  color: "#ffffff",
                  width: "74px",
                }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        <div className="flex gap-[15px]">
          {isEditing ? (
            <Button
              style={{
                backgroundColor: "#1677ff",
                color: "#ffffff",
                width: "75px",
              }}
              onClick={() => {
                onEdit(id);
              }}
            >
              Edit
            </Button>
          ) : (
            <Button
              style={{
                backgroundColor: "#1677ff",
                color: "#ffffff",
                width: "75px",
              }}
              onClick={() => {
                onApply(id);
                setCommandThreadId();
              }}
            >
              Apply
            </Button>
          )}
          <Button
            style={{
              backgroundColor: "#212121",
              color: "#ffffff",
              width: "75px",
            }}
            onClick={() => {
              setShowModal(true);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
