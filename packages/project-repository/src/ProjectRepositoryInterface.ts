import { ProjectConfiguration } from '@goldstack/utils-project';
import ProjectData from './types/ProjectData';
export type ProjectId = string;

interface ProjectRepository {
  addProject(configuration: ProjectConfiguration): Promise<ProjectId>;
  updateProjectConfiguration(
    id: ProjectId,
    configuration: ProjectConfiguration
  ): Promise<void>;
  readProjectConfiguration(
    id: ProjectId
  ): Promise<ProjectConfiguration | undefined>;
  updateProjectData(id: ProjectId, projectData: ProjectData): Promise<void>;
  getProjectData(id: ProjectId): Promise<ProjectData>;
  downloadProject(id: ProjectId, path: string): Promise<void>;
  uploadProject(id: ProjectId, path: string): Promise<void>;
}

export default ProjectRepository;
