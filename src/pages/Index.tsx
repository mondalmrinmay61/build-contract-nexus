
import Navigation from "@/components/Navigation";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Categories from "@/components/home/Categories";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Categories />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
