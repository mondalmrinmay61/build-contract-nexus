
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-8">
            About ContractHub
          </h1>
          <div className="prose prose-lg max-w-none">
            <p>
              ContractHub is a leading marketplace connecting factories and industrial facilities
              with qualified contractors across various sectors including construction,
              electrical, plumbing, painting, labour supply, and transportation.
            </p>
            <p>
              Our mission is to create transparency, ensure timely payments, and simplify the
              hiring and project management process in the industrial contracting space.
              We believe in creating a platform where quality work is rewarded fairly and
              where businesses can find the right expertise for their specialized needs.
            </p>
            <p>
              Founded in 2023, ContractHub has helped hundreds of factories complete their
              projects successfully while providing contractors with a steady stream of
              relevant, vetted opportunities.
            </p>
            <h2>Our Values</h2>
            <ul>
              <li>
                <strong>Transparency:</strong> Clear communication, pricing, and expectations
                between all parties.
              </li>
              <li>
                <strong>Quality:</strong> Promoting and rewarding high-quality craftsmanship
                and professional service.
              </li>
              <li>
                <strong>Reliability:</strong> Building a network of dependable contractors and
                clients.
              </li>
              <li>
                <strong>Fairness:</strong> Ensuring fair pay for contractors and fair value for
                clients.
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
