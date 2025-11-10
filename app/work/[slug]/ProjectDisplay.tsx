"use client";

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import styles from './ProjectPage.module.css';
import RichText from '../../RichText';
import Arrow12 from '../../Arrow12';

type Attachment = {
  type: string;
  width?: number;
  height?: number;
  url: string;
};

type Project = {
  id: string;
  year: string;
  heading: string;
  url?: string | null;
  collaborators?: string[];
  description?: string | null;
  attachments?: Attachment[];
  type?: string;
  title?: string;
  company?: string;
};

type ProjectDisplayProps = {
  project: Project;
};

const ProjectDisplay: React.FC<ProjectDisplayProps> = ({ project }) => {
  // Fallback to heading if title is not present
  const displayTitle = project.title || project.heading;
  
  // Separate images and videos
  const images = project.attachments?.filter(att => att.type === 'image') || [];
  const videos = project.attachments?.filter(att => att.type === 'video') || [];
  
  return (
    <article className={styles.projectDisplay}>
      <header className={styles.projectHeader}>
        <div className={styles.backLink}>
          <Link href="/">← Back to projects</Link>
        </div>
        
        <h1 className={styles.projectTitle}>• {displayTitle}</h1>
        
        {(project.company || project.year) && (
          <div className={styles.projectMeta}>
            {project.company && <span className={styles.projectCompany}>{project.company}</span>}
            {project.company && project.year && <span className={styles.metaSeparator}> • </span>}
            {project.year && <span className={styles.projectYear}>{project.year}</span>}
          </div>
        )}
      </header>

      {/* Context Section */}
      <section className={styles.projectSection}>
        <h2 className={styles.sectionHeading}>Context: <span className={styles.sectionArrow}>↓</span></h2>
        {project.description && (
          <div className={styles.projectDescription}>
            <RichText text={project.description} />
          </div>
        )}
      </section>

      {/* Main Image - First attachment if available */}
      {images.length > 0 && (
        <div className={styles.heroImage}>
          <Image
            src={images[0].url}
            alt={displayTitle}
            width={images[0].width || 1200}
            height={images[0].height || 800}
            layout="responsive"
            objectFit="cover"
            quality={95}
          />
        </div>
      )}

      {/* Media Section - A */}
      {images.length > 1 && (
        <section className={styles.projectSection}>
          <h2 className={styles.sectionHeading}>A: <span className={styles.sectionArrow}>↓</span></h2>
          <div className={styles.mediaGrid}>
            {images.slice(1).map((image, index) => (
              <div key={`image-${index}`} className={styles.mediaItem}>
                <Image
                  src={image.url}
                  alt={`${displayTitle} - image ${index + 2}`}
                  width={image.width || 800}
                  height={image.height || 600}
                  layout="responsive"
                  objectFit="contain"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Videos Section - B */}
      {videos.length > 0 && (
        <section className={styles.projectSection}>
          <h2 className={styles.sectionHeading}>B: <span className={styles.sectionArrow}>↓</span></h2>
          <div className={styles.mediaGrid}>
            {videos.map((video, index) => (
              <div key={`video-${index}`} className={styles.mediaItem}>
                <video controls width="100%" height="auto" poster={images[0]?.url}>
                  <source src={video.url} type={`video/${video.url.split('.').pop()}`} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* External Link - C */}
      {project.url && (
        <section className={styles.projectSection}>
          <h2 className={styles.sectionHeading}>C: <span className={styles.sectionArrow}>↓</span></h2>
          <div className={styles.projectExternalLink}>
            <a 
              href={project.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.projectLink}
            >
              View Live Project<span className={styles.linkArrow}>&#xfeff;<Arrow12 fill="currentColor"/></span>
            </a>
            <p className={styles.externalLinkDescription}>
              Experience the full project on its dedicated website.
            </p>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <footer className={styles.projectFooter}>
        <div className={styles.disclaimer}>
          <p>This project presentation is for portfolio purposes.</p>
        </div>
        <div className={styles.backToTopLink}>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
            Back to top ↑
          </a>
        </div>
      </footer>
    </article>
  );
};

export default ProjectDisplay; 