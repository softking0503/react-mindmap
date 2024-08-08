"use client";

export default function Header() {
  return (
    <div className="h-[40px] w-full border-b-[1px] border-b-black border-b-solid relative flex justify-center items-center">
      <div className="absolute h-[100%] w-[90px] flex justify-between items-center left-0 top-0 pl-[15px] max-[400px]:w-[70px]">
        <div className="h-[15px] w-[15px] rounded-[10px] border-[0.75px] border-current border-solid"></div>
        <div className="h-[15px] w-[15px] rounded-[10px] border-[0.75px] border-current border-solid"></div>
        <div className="h-[15px] w-[15px] rounded-[10px] border-[0.75px] border-current border-solid"></div>
      </div>
      <h1>MindMap Tool</h1>
    </div>
  );
}
