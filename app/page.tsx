import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Certifications } from "@/components/Certifications";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Testimonials } from "@/components/Testimonials";
import { GitHubActivity } from "@/components/GitHubActivity";
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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
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
        <GitHubActivity username="maulido" />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
