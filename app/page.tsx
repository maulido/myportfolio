import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Certifications } from "@/components/Certifications";
import { Projects } from "@/components/Projects";
import { Testimonials } from "@/components/Testimonials";
import { GitHubActivity } from "@/components/GitHubActivity";
import { Contact } from "@/components/Contact";
import Separator from "@/components/Separator";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Portfolio | Network Engineer & Software Engineer',
  description: 'Professional portfolio showcasing projects in network engineering and software development.',
  openGraph: {
    title: 'My Portfolio',
    description: 'Hi, I am a Network & Software Engineer. Check out my work!',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      name: 'Maulido',
      jobTitle: ['Network Engineer', 'Software Engineer', 'Cloud Architect', 'DevOps Engineer'],
      description: 'Professional portfolio showcasing projects in network engineering and software development.',
      sameAs: [
        'https://github.com/maulido'
      ]
    },
    {
      '@type': 'WebSite',
      name: 'My Portfolio | Network Engineer & Software Engineer',
      description: 'Professional portfolio showcasing projects in network engineering and software development.'
    }
  ]
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Separator />
        <About />
        <Skills />
        <Experience />
        <Certifications />
        <Projects />
        <Testimonials />
        <GitHubActivity />
        <Contact />
      </main>
    </div>
  );
}
