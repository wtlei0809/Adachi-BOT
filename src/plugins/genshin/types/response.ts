import { Abyss } from "./abyss";
import { BBS } from "./hoyobbs";
import { Character } from "./character";
import { UserInfo } from "./user-info";
import { Note } from "./note";
import { SignInInfo, SignInResult } from "#genshin/types/sign-in";

export type ResponseDataType = Abyss | BBS | Character |
	UserInfo | Note | SignInInfo | SignInResult;

export interface ResponseBody {
	retcode: number;
	message: string;
	data: ResponseDataType;
}