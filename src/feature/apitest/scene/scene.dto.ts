import { Param } from "@nestjs/common";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class FindSceneInfoParamDto {
    
    @IsNotEmpty()
    @IsString()
    sceneId: string
}

export class DeleteSceneInfoParamDto {
    @IsNotEmpty()
    @IsString()
    sceneId: string
}


export class CreateSceneInfoDto {

    @IsNotEmpty()
    @IsString()
    sceneName: string

    @IsNotEmpty()
    @IsString()
    moduleId: string

    @IsNotEmpty()
    @IsString()
    dataId?: string
}

export class UpdateSceneDto {
    @IsNotEmpty()
    @IsString()
    sceneId: string

    @IsNotEmpty()
    @IsString()
    sceneName?: string

    @IsNotEmpty()
    @IsString()
    moduleId?: string

    @IsNotEmpty()
    @IsString()
    dataId?: string

    @IsNotEmpty()
    @IsNumber()
    isEnable?: number

}