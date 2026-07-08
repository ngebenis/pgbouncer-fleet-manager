export type PgRow = Record<string, string | number | boolean | null>
export interface RowsResponse { rows: PgRow[] | null }
export interface StatusResponse { status: string }
export interface VersionResponse { version: string }
export interface ActionResponse { ok?: boolean; output?: string; error?: string }
export interface IniSection { Name: string; Values: Record<string, string> }
export interface RawConfigResponse { sections: IniSection[] }
export interface ServerInfo { id: string; label: string; host: string; port: string; control_mode: string }
export interface ServersListResponse { servers: ServerInfo[] }
