"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from 'next/link';
import RichText from "./RichText";
import Arrow12 from "./Arrow12";
import styles from "./Profile.module.css";
import Attachments from "./Attachments";
import ChevronRight from './ChevronRight';

// Utility to generate slugs from headings (same as in project page)
const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
};

type ProfileProps = {
  cv: any,
};
const Profile: React.FC<ProfileProps> = ({
  cv
}) => {
  // Initialize all sections as collapsed by default
  const initializeCollapsedSections = () => {
    const sections: {[key: string]: boolean} = {};
    
    // Add all collection names, excluding hidden ones
    cv.allCollections.forEach((collection: any) => {
      if (!collection.hidden) {
        sections[collection.name] = true;
      }
    });
    
    // Add the custom Honors section
    sections["Honors"] = true;
    
    return sections;
  };
  
  // Track which sections are collapsed - initialize all as collapsed
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>(
    initializeCollapsedSections()
  );
  
  // Add a useEffect to re-initialize collapsedSections when cv data changes
  useEffect(() => {
    setCollapsedSections(initializeCollapsedSections());
  }, [cv.allCollections]); // Dependency array includes cv.allCollections
  
  // Track sections that are animating out
  const [animatingOut, setAnimatingOut] = useState<{[key: string]: boolean}>({});
  
  // Toggle section collapse state
  const toggleSection = (sectionName: string) => {
    if (!collapsedSections[sectionName]) {
      // If currently expanded, start the exit animation
      setAnimatingOut(prev => ({...prev, [sectionName]: true}));
      // After animation completes, actually collapse the section
      setTimeout(() => {
        setCollapsedSections(prev => ({...prev, [sectionName]: true}));
        setAnimatingOut(prev => ({...prev, [sectionName]: false}));
      }, 200); // Reduced from 300ms to 200ms for snappier exit
    } else {
      // If currently collapsed, just expand it
      setCollapsedSections(prev => ({...prev, [sectionName]: false}));
    }
  };
  
  // Add this function before the return statement in the Profile component
  const combineHonorsSections = () => {
    // Find the original sections and filter out hidden items
    const awards = cv.allCollections.find((c: any) => c.name === "Awards")?.items.filter((item: any) => !item.hidden) || [];
    const exhibitions = cv.allCollections.find((c: any) => c.name === "Exhibitions")?.items.filter((item: any) => !item.hidden) || [];
    const features = cv.allCollections.find((c: any) => c.name === "Features")?.items.filter((item: any) => !item.hidden) || [];
    
    // Combine all items
    const honorsItems = [...awards, ...exhibitions, ...features];
    
    // Sort by 'order' property (if present), then by year (most recent first)
    honorsItems.sort((a, b) => {
      const orderA = a.order;
      const orderB = b.order;

      // Prioritize items with 'order' property
      const aHasOrder = orderA !== undefined;
      const bHasOrder = orderB !== undefined;

      if (aHasOrder && bHasOrder) {
        return orderA - orderB; // Sort by order, ascending
      }
      if (aHasOrder) {
        return -1; // 'a' comes before 'b'
      }
      if (bHasOrder) {
        return 1; // 'b' comes before 'a'
      }

      // If neither has 'order', sort by year (descending)
      // Handle potential NaN from parseInt if year is not purely numeric
      const yearAString = a.year ? String(a.year).split(' ')[0] : '0';
      const yearBString = b.year ? String(b.year).split(' ')[0] : '0';
      
      const yearA = parseInt(yearAString);
      const yearB = parseInt(yearBString);

      if (isNaN(yearA) && isNaN(yearB)) return 0; // Both are NaN, treat as equal
      if (isNaN(yearA)) return 1; // Put NaN years (e.g. "Ongoing") after numeric years in descending sort
      if (isNaN(yearB)) return -1; // Put NaN years (e.g. "Ongoing") after numeric years in descending sort

      return yearB - yearA; // Descending for years
    });
    
    return {
      name: "Honors",
      items: honorsItems
    };
  };

  // Create the combined honors section
  const honorsSection = combineHonorsSections();

  // Add a function to get the display name for a section
  const getSectionDisplayName = (originalName: string) => {
    switch(originalName) {
      case "Work Experience":
        return "Experience";
      case "Projects":
        return "Work";
      default:
        return originalName;
    }
  };

  // Get the order from the general.sectionOrder array
  const sectionOrder = cv.general.sectionOrder || [];

  // Create a map for quick lookup of order index
  const sectionOrderMap = sectionOrder.reduce((map: {[key: string]: number}, section: string, index: number) => {
    map[section] = index;
    return map;
  }, {} as {[key: string]: number});

  // Sort collections based on the order in sectionOrder
  const sortedCollections = [...cv.allCollections]
    .filter((collection: {name: string, hidden?: boolean}) => 
      !collection.hidden && // Exclude collections marked as hidden
      !["Awards", "Exhibitions", "Features", "Education", "Contact"].includes(collection.name)
    )
    .sort((a, b) => {
      // Map original names to display names for sorting
      const nameA = getSectionDisplayName(a.name);
      const nameB = getSectionDisplayName(b.name);
      
      // Get the index from the order map, default to a high number if not found
      const orderA = sectionOrderMap[nameA] !== undefined ? sectionOrderMap[nameA] : 999;
      const orderB = sectionOrderMap[nameB] !== undefined ? sectionOrderMap[nameB] : 999;
      
      return orderA - orderB;
    });

  // In the Profile component, before rendering
  // Update the Projects collection items to use "client" instead of "year"
  const projectsCollection = sortedCollections.find(c => c.name === "Projects");
  if (projectsCollection) {
    // Update the items in the Projects collection
    projectsCollection.items.forEach((item: any) => {
      // Make sure we're using the client field instead of year
      if (item.company) {
        item.year = item.company;
      }
    });
  }

  // In your Profile.tsx, add this before the return statement
  console.log("CV data structure:", JSON.stringify(cv, null, 2));
  console.log("Sorted collections:", JSON.stringify(sortedCollections, null, 2));

  return (
    <div className={styles.profile}>
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          {/* Add hero image above the byline */}
          <div className={styles.heroImage}>
            <Image 
              src="/content/media/mn_logo.png" 
              alt="" 
              width={540} 
              height={300} 
              layout="responsive"
              objectFit="cover"
            />
          </div>
          
          <h1>{cv.general.displayName}</h1>
          <div className={styles.byline}>
            <span>Martin Nayeri is a designer who blends a deep knowledge of UX and a passion for games to create digital experiences that people love.</span>
            <span> His work has been written about in </span>
            <StyledLink href="https://www.wired.com/story/rewilding-climate-change-gig-work/">Wired</StyledLink>
            <span>, used in a </span>
            <StyledLink href="https://martinnayeri.com/work/snow-city/">Coach</StyledLink>
            <span> campaign, sponsored by </span>
            <StyledLink href="https://open.spotify.com/show/6YIm23KPwxoWDpcnlwGwLP">Adobe</StyledLink>
            <span>, and even featured at his </span>
            <StyledLink href="https://www.deathbyaudioarcade.com/wondercab">favorite bar</StyledLink>
            <span> in Brooklyn.</span>
          </div>
          {cv.general.website ?
            <a className={styles.website}>{cv.general.website}</a>
          : null}
        </div>
      </div>

      {/* {cv.general.about ?
        <section 
          className={`${styles.profileSection} ${styles.about} ${collapsedSections["About"] ? styles.collapsed : ""}`}
        >
          <h3 className={styles.sectionHeader}>
            <button 
              className={styles.collapseToggle} 
              onClick={() => toggleSection("About")}
              aria-expanded={!collapsedSections["About"]}
            >
              About
              <span className={`${styles.toggleIcon} ${styles.rightAligned} ${!collapsedSections["About"] ? styles.expanded : ""}`}>›</span>
            </button>
          </h3>
          {(!collapsedSections["About"] || animatingOut["About"]) && (
            <div className={`${styles.description} ${animatingOut["About"] ? styles.fadeOut : ""}`}>
              <div className={styles.sectionContent}>
                <RichText text={cv.general.about}/>
              </div>
            </div>
          )}
        </section>
      : null} */}
      {sortedCollections.map((collection: any, index: number) => {
        let itemsToRender = collection.items;

        // Sort items for specific sections that support internal ordering
        if (collection.name === "Work Experience" || collection.name === "Projects") {
          itemsToRender = [...collection.items].sort((a, b) => {
            const orderA = a.order;
            const orderB = b.order;
            const aHasOrder = orderA !== undefined && orderA !== null;
            const bHasOrder = orderB !== undefined && orderB !== null;

            if (aHasOrder && bHasOrder) {
              return orderA - orderB; // Sort by order, ascending
            }
            if (aHasOrder) {
              return -1; // 'a' (with order) comes before 'b' (without order)
            }
            if (bHasOrder) {
              return 1; // 'b' (with order) comes before 'a' (without order)
            }

            // Fallback: Sort by year (descending for most recent first)
            const parseStartYear = (yearStr: any) => {
              if (!yearStr || typeof yearStr !== 'string') return 0;
              const firstPart = yearStr.split(' ')[0];
              const year = parseInt(firstPart, 10);
              // Treat "Now", "Ongoing" or other non-numeric as 0 for sorting purposes,
              // placing them after specific years in a descending sort.
              return isNaN(year) ? 0 : year;
            };

            const yearA = parseStartYear(a.year);
            const yearB = parseStartYear(b.year);

            // Handles cases: specific years vs 0 (e.g. "Now", "Ongoing", non-parseable company name)
            if (yearA === 0 && yearB !== 0) return 1; // yearA (0) goes after yearB (specific year)
            if (yearB === 0 && yearA !== 0) return -1; // yearB (0) goes after yearA (specific year)
            if (yearA === 0 && yearB === 0) return 0; // Both are 0, maintain original relative order for stability

            return yearB - yearA; // Descending sort for specific years
          });
        }

        return (
          <section 
            key={collection.name} 
            className={`${styles.profileSection} ${collapsedSections[collection.name] ? styles.collapsed : ""}`}
          >
            <h3 className={styles.sectionHeader}>
              <button 
                className={styles.collapseToggle} 
                onClick={() => toggleSection(collection.name)}
                aria-expanded={!collapsedSections[collection.name]}
              >
                {getSectionDisplayName(collection.name)}
                <ChevronRight className={`${styles.toggleIcon} ${styles.rightAligned} ${!collapsedSections[collection.name] ? styles.expanded : ""}`} />
              </button>
            </h3>
            {(!collapsedSections[collection.name] || animatingOut[collection.name]) && (
              <div className={`${collection.name === "Contact" ? styles.contacts : styles.experiences} ${animatingOut[collection.name] ? styles.fadeOut : ""}`}>
                {itemsToRender
                  .filter((experience: any) => !experience.hidden) // Filter out hidden items
                  .map((experience: any, itemIndex: number) => { 
                  // Calculate delay - for fadeIn use itemIndex, for fadeOut use reverse order
                  const itemCount = itemsToRender.length;
                  const delay = animatingOut[collection.name] 
                    ? `${(itemCount - itemIndex - 1) * 20}ms` 
                    : `${itemIndex * 50}ms`;                  
                  
                  if (collection.name === "Contact") {
                    return (
                      <div 
                        key={experience.url} 
                        className={`${styles.sectionContent}`} 
                        style={{animationDelay: delay}}
                      >
                        <ContactItem experience={experience}/>
                      </div>
                    );
                  }
                  return (
                    <div 
                      key={experience.heading} 
                      className={`${styles.sectionContent}`} 
                      style={{animationDelay: delay}}
                    >
                      <ProfileItem 
                        experience={experience} 
                        sectionName={collection.name}
                        getSectionDisplayName={getSectionDisplayName}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )
      })}

      {/* Render the combined Honors section */}
      <section 
        key="Honors" 
        className={`${styles.profileSection} ${collapsedSections["Honors"] ? styles.collapsed : ""}`}
      >
        <h3 className={styles.sectionHeader}>
          <button 
            className={styles.collapseToggle} 
            onClick={() => toggleSection("Honors")}
            aria-expanded={!collapsedSections["Honors"]}
          >
            Honors
            <ChevronRight className={`${styles.toggleIcon} ${styles.rightAligned} ${!collapsedSections["Honors"] ? styles.expanded : ""}`} />
          </button>
        </h3>
        {(!collapsedSections["Honors"] || animatingOut["Honors"]) && (
          <div className={`${styles.experiences} ${animatingOut["Honors"] ? styles.fadeOut : ""}`}>
            {honorsSection.items
              .filter((item: any) => !item.hidden) // Filter out hidden items
              .map((item: any, index: number) => {
              // Calculate delay for animation
              const itemCount = honorsSection.items.length;
              const delay = animatingOut["Honors"] 
                ? `${(itemCount - index - 1) * 20}ms`
                : `${index * 50}ms`;
              
              return (
                <div 
                  key={item.id} 
                  className={`${styles.sectionContent}`} 
                  style={{animationDelay: delay}}
                >
                  <ProfileItem 
                    experience={item} 
                    sectionName="Honors"
                    getSectionDisplayName={getSectionDisplayName}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

type ProfileItemProps = {
  experience: any,
  sectionName: string,
  getSectionDisplayName: (name: string) => string,
};
const ProfileItem: React.FC<ProfileItemProps> = ({
  experience,
  sectionName,
  getSectionDisplayName
}) => {
  // Add a visible debug element
  const debugInfo = JSON.stringify({
    heading: experience.heading,
    year: experience.year,
    url: experience.url
  }, null, 2);
  
  let titleContent = experience.heading;
  if (experience.url && sectionName !== "Projects") { // Original links for non-project items
    titleContent = <>
      <a href={experience.url} target="_blank" rel="noopener noreferrer">{experience.heading}</a><span className={styles.linkArrow}>&#xfeff;<Arrow12 fill="var(--grey1)"/></span>
    </>;
  } else if (sectionName === "Projects") {
    // For "Projects" (Work), link to the dynamic project page with Arrow12 and styling
    const projectSlug = slugify(experience.heading);
    titleContent = <>
      <Link href={`/work/${projectSlug}`} className={styles.styledWorkLink}>
        {experience.heading}
        <span className={styles.linkArrow}>&#xfeff;<Arrow12 fill="var(--grey1)"/></span>
      </Link>
    </>;
  } else {
    titleContent = experience.heading;
  }
  
  // Determine if we should show the year field as "client" instead
  // Check both the original name and the display name
  const isWorkSection = sectionName === "Projects" || getSectionDisplayName(sectionName) === "Work";

  // Add console log to debug
  console.log(`Section: ${sectionName}, isWorkSection: ${isWorkSection}, year: ${experience.year}`);

  // Add a label for the year/client field
  const fieldLabel = isWorkSection ? "Client" : "Year";
  const yearLabel = experience.year;
  
  // Add a CSS class to style the label differently for work items
  const yearClassName = isWorkSection ? styles.client : styles.year;

  return (
    <div className={styles.experience}>
      
      <div className={styles.year}>
        <span>{yearLabel}</span>
      </div>
      <div className={styles.experienceContent}>
        <div className={styles.title}>
          {titleContent}
        </div>
        {experience.location ?
        <div className={styles.location}>{experience.location}</div>
        : null}
        {experience.description ?
        <div className={styles.description}>
          <RichText text={experience.description}/>
        </div>
        : null}
        {experience.attachments && experience.attachments.length > 0 ?
          <Attachments attachments={experience.attachments}/>
        : null}
      </div>
    </div>
  )
}

type ContactItemProps = {
  experience: any,
};
const ContactItem: React.FC<ContactItemProps> = ({
  experience
}) => {
  return (
    <div className={styles.experience}>
      <div className={styles.year}>
        <span>{experience.platform}</span>
      </div>
      <div className={styles.experienceContent}>
        <div className={styles.title}>
          <a href={experience.url} target="_blank">{experience.handle}</a><span className={styles.linkArrow}>&#xfeff;<Arrow12/></span>
        </div>
      </div>
    </div>
  )
}

// Add this component for styled links
const StyledLink: React.FC<{href: string, children: React.ReactNode}> = ({
  href,
  children
}) => {
  return (
    <span className={styles.styledLink}>
      <a href={href} target="_blank">{children}</a>
      <span className={styles.linkArrow}>&#xfeff;<Arrow12 fill="var(--grey1)"/></span>
    </span>
  );
};

export default Profile;
