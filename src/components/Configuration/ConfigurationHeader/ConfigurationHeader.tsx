"use client";

import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";

export default function ConfigurationHeader() {
  return (
    <div className="w-full h-[40px] border-b-[1px] border-solid border-black flex justify-between items-center px-[10px]">
      <div>
        <h1>Configuration</h1>
      </div>
      <div className="flex w-[50px] justify-between items-center">
        <div>
          <PlusCircleOutlined className="text-[20px]" />
        </div>
        <div>
          <MinusCircleOutlined className="text-[20px]" />
        </div>
      </div>
    </div>
  );
}
