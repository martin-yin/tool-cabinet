import fs from "fs";
import path from "path";

export function dotExistDirectoryCreate(directory: string) {
  return new Promise((resolve) => {
    mkdirs(directory, function () {
      resolve(true);
    });
  });
}

export function mkdirs(directory: string, callback: () => void) {
  var exists = fs.existsSync(directory);
  if (exists) {
    callback();
  } else {
    mkdirs(path.dirname(directory), function () {
      fs.mkdirSync(directory);
      callback();
    });
  }
}

export async function generateFile(
  directory: string,
  file: string,
  data: string
): Promise<boolean> {
  console.log("正在创建创建文件:", directory);
  if (!fs.existsSync(directory)) {
    await dotExistDirectoryCreate(directory);
  }
  if (fs.existsSync(`${directory}/${file}`)) {
    console.log(`创建文件失败，${file}文件已经存在`);
    return false;
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(`${directory}/${file}`, data, "utf8", (err) => {
      if (err) {
        console.log(`创建创建文件失败:${file}`, err);
        reject(err);
      } else {
        console.log(`创建创建文件成功:${file}`, file);
        resolve(true);
      }
    });
  });
}
