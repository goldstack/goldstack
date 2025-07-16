import type { ProjectData } from '@goldstack/project-repository';

/**
 * Completing project data with information that is not provided in the configuration steps.
 *
 */
export const buildProjectData = (params: {
  projectData: ProjectData;
}): ProjectData => {
  return params.projectData;
};
