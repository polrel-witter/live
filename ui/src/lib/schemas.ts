import { z } from "zod";

export const StringWithDashes = z.custom<string>((val) => {
  // regex enforces either "string" or strings delimited by dashes "str-ing"
  return typeof val === "string" ? /^\w+(?:-\w+)*$/.test(val) : false;
})
