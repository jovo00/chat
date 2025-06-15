export const dataTypes = {
  CONTENT: "c",
  REASONING: "r",
};

export const validDataTypes = Object.values(dataTypes);

export function encodeData(dataType: string, data: any) {
  return `${dataType}:${JSON.stringify(data)}\n`;
}
