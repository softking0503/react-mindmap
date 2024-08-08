"use client";
import { Input } from "antd";
import { useEffect, useState } from "react";
import useMindMapStore from "@/stores/mapStore";

const { TextArea } = Input;

export default function RequestInstructions() {
  const [requestInstruction, setRequestInstruction] = useState<string>("");

  const { setRequestContent, getDatas } = useMindMapStore();

  const setRequestInstructions = (value: string) => {
    setRequestInstruction(value);

    setRequestContent(value);
  };

  const fetchData = () => {
    const data = getDatas();

    setRequestInstruction(data[0].RequestInstruction);
  };

  useEffect(() => {
    fetchData();

    window.addEventListener("projectChanged", fetchData);

    return () => {
      window.removeEventListener("projectChanged", fetchData);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-[20px]">
      <h1 className="text-[24px] max-[630px]:text-[20px]">
        Request Instructions
      </h1>
      <TextArea
        autoSize={{ minRows: 6, maxRows: 10 }}
        className="text-[18px]"
        value={requestInstruction}
        onChange={(e) => {
          setRequestInstructions(e.target.value);
        }}
      />
    </div>
  );
}
