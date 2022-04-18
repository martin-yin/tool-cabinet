export function fristToUpperCase(str: string) {
  const newStr = str.trim().toLowerCase();
  return newStr
    .split("-")
    .map((value: string) => firstToUpper(value))
    .join("");
}

export function firstToUpper(str: string) {
  return str.trim().toLowerCase().replace(str[0], str[0].toUpperCase());
}
