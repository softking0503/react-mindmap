"use client";
import CommandsGroup from "./CommandGroup/CommandsGroup";
import ConfigurationHeader from "./ConfigurationHeader/ConfigurationHeader";

export default function Configuration() {
  return (
    <div className="w-full h-auto border-[1px] border-solid border-black">
      <ConfigurationHeader />
      <div className="w-[full] p-[30px] max-[560px]:px-[15px]">
        <CommandsGroup />
      </div>
    </div>
  );
}
