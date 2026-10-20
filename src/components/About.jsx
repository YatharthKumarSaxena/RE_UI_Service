import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Languages,
  Layers,
  Lightbulb,
  Workflow,
} from 'lucide-react';

const capabilities = [
  {
    icon: Brain,
    title: 'AI-assisted classification',
    description:
      'Explore how machine-learning models can categorize requirements and related engineering content.',
  },
  {
    icon: Layers,
    title: 'Single and bulk workflows',
    description:
      'Try individual inputs or upload datasets to examine how AI can support larger requirements workflows.',
  },
  {
    icon: BarChart3,
    title: 'Insights and evaluation',
    description:
      'Review dataset patterns and compare model evaluation results to understand their strengths and limitations.',
  },
  {
    icon: Languages,
    title: 'Language support',
    description:
      'Use translation and normalization tools to make requirement text easier to analyze.',
  },
];

export default function About() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            <Lightbulb className="h-4 w-4" />
            Major Project · AI for Requirements Engineering
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Bringing AI into Requirements Engineering
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            This project explores how artificial intelligence and machine learning can
            assist Requirements Engineering (RE)—from understanding and organizing
            requirement text to analyzing datasets and evaluating models.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The goal is to support engineers with useful analysis and repeatable
            workflows, while keeping people in control of interpretation and final
            decisions.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
            <Workflow className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              What you can explore
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The current UI brings the service's AI-supported workflows together.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <article key={title} className="glass-panel rounded-2xl p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-2xl border border-teal-500/20 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Built to grow with the backend
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              This frontend is the user-facing companion to the AI service. As the
              backend evolves, the UI can grow with it—bringing new endpoints,
              capabilities, and RE workflows into one place.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <span>An evolving project, developed alongside the service</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
