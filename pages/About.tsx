import React from 'react';
import { BookOpen, ScanLine, BrainCircuit, Share2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Sanskrit', manuscripts: 120 },
  { name: 'Persian', manuscripts: 85 },
  { name: 'Latin', manuscripts: 60 },
  { name: 'Greek', manuscripts: 45 },
  { name: 'Other', manuscripts: 30 },
];

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-arch-bg bg-paper-texture">
      <section className="py-20 px-4 text-center">
        <BookOpen className="h-12 w-12 mx-auto text-arch-accent mb-6" />
        <h1 className="font-serif text-5xl font-bold text-stone-900 mb-6">About Saraswati Archives</h1>
        <p className="max-w-3xl mx-auto text-lg text-stone-700 leading-relaxed">
          Our mission is to build a bridge to the past. We are dedicated to preserving the world's most 
          vulnerable written heritage by transforming fragile manuscripts into a dynamic, intelligent, and 
          universally accessible digital library.
        </p>
      </section>

      <section className="py-16 bg-white border-y border-stone-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-stone-50 p-8 rounded-xl text-center space-y-4 border border-stone-100">
                <div className="bg-arch-accent/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                    <ScanLine className="h-8 w-8 text-arch-accent" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Digitize & Extract</h3>
                <p className="text-stone-600">
                    We use advanced OCR technology and high-resolution imaging to scan ancient manuscripts 
                    and extract their precious texts, making them searchable and accessible.
                </p>
            </div>
            <div className="bg-stone-50 p-8 rounded-xl text-center space-y-4 border border-stone-100">
                 <div className="bg-arch-accent/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                    <BrainCircuit className="h-8 w-8 text-arch-accent" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">AI-Powered Insights</h3>
                <p className="text-stone-600">
                    Our system employs powerful AI to analyze, summarize, and categorize manuscripts, 
                    uncovering historical context and cultural significance automatically.
                </p>
            </div>
             <div className="bg-stone-50 p-8 rounded-xl text-center space-y-4 border border-stone-100">
                 <div className="bg-arch-accent/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                    <Share2 className="h-8 w-8 text-arch-accent" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Preserve & Share</h3>
                <p className="text-stone-600">
                    By creating a robust digital archive, we ensure this invaluable knowledge is 
                    preserved for future generations and shared with the world freely.
                </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center text-stone-900 mb-10">Current Collection Stats</h2>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" tick={{fill: '#57534e'}} axisLine={{stroke: '#a8a29e'}} />
              <YAxis tick={{fill: '#57534e'}} axisLine={{stroke: '#a8a29e'}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#fafaf9', borderColor: '#e7e5e4', borderRadius: '8px'}}
                itemStyle={{color: '#92400e'}}
              />
              <Legend />
              <Bar dataKey="manuscripts" fill="#A68A64" name="Manuscripts Count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="py-20 text-center bg-arch-bg">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6">Join Our Mission</h2>
        <p className="text-stone-600 mb-8 max-w-2xl mx-auto">
            Explore the collection, share our work, or contribute to the preservation of knowledge.
        </p>
        <Button size="lg" onClick={() => navigate('/gallery')}>
            Explore the Collection
        </Button>
      </section>
    </div>
  );
};