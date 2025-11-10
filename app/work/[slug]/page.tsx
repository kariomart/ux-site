// @ts-nocheck
import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import type { ResolvingMetadata } from 'next';
import ProjectDisplay from './ProjectDisplay';
import styles from './ProjectPage.module.css';

// Utility to generate slugs from headings
const slugify = (text: string): string => {
  if (!text) return ''; // Added safety check
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Corrected: Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
};

type Project = {
  id: string;
  year: string;
  heading: string;
  url?: string | null;
  collaborators?: string[];
  description?: string | null;
  attachments?: Array<{
    type: string;
    width?: number;
    height?: number;
    url: string;
  }>;
  type?: string;
  title?: string;
  company?: string;
  // Add any other fields from your project items here
};

type CVData = {
  allCollections: Array<{
    name: string;
    items: Array<any>;
  }>;
  // Add other top-level cv data structure if needed
};

async function getProjectData(slug: string): Promise<Project | undefined> {
  const filePath = path.join(process.cwd(), 'public', 'content', 'profileData.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const cv: CVData = JSON.parse(fileContents);

  const projectsCollection = cv.allCollections.find(collection => collection.name === "Projects");
  console.log('[getProjectData] Found projectsCollection:', !!projectsCollection);
  if (!projectsCollection) {
    return undefined;
  }

  console.log(`[getProjectData] Searching for slug: ${slug} in items:`, projectsCollection.items.map(i => slugify(i.heading)));

  const project = projectsCollection.items.find(
    (item): item is Project => slugify(item.heading) === slug
  );
  console.log(`[getProjectData] Found project for slug '${slug}':`, !!project);
  return project;
}

export async function generateStaticParams() {
  console.log('[generateStaticParams] Starting');
  const filePath = path.join(process.cwd(), 'public', 'content', 'profileData.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const cv: CVData = JSON.parse(fileContents);

  const projectsCollection = cv.allCollections.find(collection => collection.name === "Projects");
  console.log('[generateStaticParams] Found projectsCollection:', !!projectsCollection);

  if (!projectsCollection || !projectsCollection.items) {
    console.log('[generateStaticParams] No projects collection or items found, returning [].');
    return [];
  }

  const generatedSlugs = projectsCollection.items.map((item) => ({
    slug: slugify(item.heading),
  }));
  console.log('[generateStaticParams] Generated slugs:', generatedSlugs);
  return generatedSlugs;
}

// Define the page params type
type PageParams = {
  slug: string;
};

// Let Next.js handle the metadata type inference
export async function generateMetadata({ params }) {
  const { slug } = params;
  const project = await getProjectData(slug);
  
  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }
  
  const displayTitle = project.title || project.heading;
  
  return {
    title: `${displayTitle} | Martin Nayeri`,
    description: project.description?.substring(0, 160) || `${displayTitle} project by Martin Nayeri`,
    openGraph: {
      title: `${displayTitle} | Martin Nayeri`,
      description: project.description?.substring(0, 160) || `${displayTitle} project by Martin Nayeri`,
      images: project.attachments?.filter(a => a.type === 'image').map(a => a.url) || [],
    },
  };
}

// Use the default page component name that Next.js expects
export default async function Page({ params }) {
  const { slug } = params;
  console.log(`[Page] Rendering page for slug: ${slug}`);
  const project = await getProjectData(slug);

  if (!project) {
    console.log(`[Page] Project not found for slug: ${slug}, calling notFound().`);
    notFound();
  }

  return (
    <div className={styles.projectPageContainer}>
      <ProjectDisplay project={project} />
    </div>
  );
}