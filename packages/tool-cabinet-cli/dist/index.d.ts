import { AxiosInterceptorManager } from 'axios';
import { AxiosRequestConfig } from 'axios';
import { AxiosResponse } from 'axios';

/**
 * @public
 */
export declare class ContainerRepository {
    readonly containerMap: Map<string, RepositoryType[]>;
    getRepository(module: string): RepositoryType[];
    registerRepository(module: string, repositorys: RepositoryType[]): void;
}

/**
 * 定义 GenerateRepositoryCode 配置
 * @public
 */
export declare function defineGenerateRepositoryCodeConfig(config: GenerateRepositoryCodeOptionsType): GenerateRepositoryCodeOptionsType;

/**
 * 定义 TsyringeInject 配置
 * @public
 */
export declare function defineTsyringeInjectConfig(config: TsyringeInjectOptionsType): TsyringeInjectOptionsType;

/**
 * @public
 */
export declare type DomainType = {
    module: string;
    repositorys: RepositoryType[];
};

/**
 * generateRepositoryCode 所需要的参数
 * @public
 */
export declare type GenerateRepositoryCodeOptionsType = {
    baseFilePath: string;
    requestConfig?: AxiosRequestConfig;
    interceptorRequest?: (config: AxiosRequestConfig<any>) => AxiosInterceptorManager<AxiosRequestConfig>;
    interceptorResponse?: (config: AxiosResponse<any, any>) => any;
    domains: DomainType[];
    plugins?: PluginType[];
};

/**
 * 自定义插件时使用此类型
 * @public
 */
export declare type PluginType = {
    type: 'template';
    name: 'entity' | 'usecase' | 'model' | 'repository';
    transform: (module: string, containerRepository: ContainerRepository) => any;
    template: (data: any) => TemplaetType;
};

/**
 * @public
 */
export declare type RepositoryType = AxiosRequestConfig & {
    result?: any;
    [x: string]: any;
};

/**
 * @public
 */
export declare type TemplaetType = {
    directory: string;
    fileName: string;
    content: string;
};

/**
 * tsyringeInject 所需要的参数
 * @public
 */
export declare type TsyringeInjectOptionsType = {
    ignoreAbstractList?: string[];
    mainSourcePath: string;
    sourceFilePathList: string[];
    tsConfigFilePath: string;
};

export { }
