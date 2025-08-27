export {}
declare global {
  module '*.gif';
  type Response = {
    data: Results[]
  }
  type Results ={
  name: string,
  result: string,
  file_path: string
  }

  interface Window  {
    electronAPI: {
      openFolder: () => Promise<string>;
      runScript: (folder1:string | undefined, folder2:string |undefined) => Promise<Results[]>;
      runOllama: (path:string, rubric:string) => Promise<string>;
      downloadFolder: () => Promise<string>;
    }
  }
}