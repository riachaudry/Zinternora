import { t, type FieldRoadmap } from './types';

const week = (title: string, summary: string, objectives: string[], tasks: ReturnType<typeof t>[]): FieldRoadmap['weeks'][number] => ({ title, summary, objectives, tasks });

export const additionalRoadmaps: FieldRoadmap[] = [
  {
    slug: 'cybersecurity', name: 'Cybersecurity', icon: 'shield',
    shortDescription: 'Security fundamentals, threat analysis, secure systems and incident response.',
    description: 'A practical four-week cybersecurity track covering security basics, risk assessment, defensive controls and an incident-response case study.',
    skills: ['Security fundamentals', 'Threat modeling', 'Risk assessment', 'Network security', 'Incident response', 'Security reporting'],
    evaluationCriteria: 'Accuracy of security analysis, practical recommendations, evidence and quality of documentation.',
    certificateCriteria: 'Complete required weekly tasks and pass the final security case review.',
    weeks: [
      week('Security foundations', 'Understand the security landscape and common threats.', ['CIA triad', 'Threats', 'Basic controls'], [t('Security glossary','Create a glossary of 25 essential security terms with examples.','Build security vocabulary.','PDF.'), t('Threat map','Map common threats against a sample organisation and explain likely impact.','Recognise threats.','PDF.',15), t('Security checklist','Create a 20-point baseline security checklist for a small business.','Translate concepts into controls.','PDF.',15)]),
      week('Risk and threat modeling', 'Identify what can go wrong and how to reduce risk.', ['Assets', 'Threat actors', 'Mitigations'], [t('Asset inventory','Create an asset inventory and classify assets by sensitivity.','Prioritise protection.','Spreadsheet.'), t('Threat model','Build a simple threat model for a web application using a diagram.','Reason about attack paths.','PDF or image.',20), t('Risk register','Create a risk register with likelihood, impact, owner and mitigation for 10 risks.','Prioritise risk.','Spreadsheet.',20)]),
      week('Defensive security', 'Design practical defensive controls.', ['Access control', 'Network defence', 'Monitoring'], [t('Access policy','Draft an access-control and password policy for a small organisation.','Apply least privilege.','PDF.',15), t('Network controls','Design a basic secure network layout and label firewall, segmentation and monitoring controls.','Understand layered defence.','Diagram.',20), t('Security monitoring','Define 10 useful security events to monitor and explain the response to each.','Build detection thinking.','PDF.',20)]),
      week('Incident response', 'Handle a simulated security incident from detection to lessons learned.', ['Triage', 'Containment', 'Reporting'], [t('Incident timeline','Analyse a simulated breach and build a chronological incident timeline.','Practise investigation.','PDF.',20), t('Response plan','Write containment, eradication and recovery steps for the incident.','Plan a response.','PDF.',25), t('Post-incident report','Produce a final report with root cause, evidence, impact and preventive actions.','Communicate security findings.','PDF.',25)]),
    ],
  },
  {
    slug: 'cloud-computing-devops', name: 'Cloud Computing & DevOps', icon: 'cloud',
    shortDescription: 'Cloud concepts, deployment, CI/CD, containers and operational thinking.',
    description: 'A project-based introduction to cloud and DevOps practices, from architecture and version control through deployment and monitoring.',
    skills: ['Cloud fundamentals', 'Linux', 'Git', 'CI/CD', 'Docker', 'Monitoring', 'Deployment'],
    evaluationCriteria: 'Correct architecture, reproducibility, deployment quality, documentation and operational reasoning.',
    certificateCriteria: 'Complete required tasks and demonstrate a working final deployment plan or project.',
    weeks: [
      week('Cloud foundations','Learn core cloud concepts and service models.',['IaaS/PaaS/SaaS','Regions','Security'],[t('Cloud comparison','Compare three cloud providers on compute, storage and database services.','Understand cloud choices.','PDF.'),t('Architecture diagram','Design a simple scalable web architecture with labelled cloud components.','Apply cloud architecture.','Diagram.',20),t('Cost awareness','Create a simple monthly cost estimate for the architecture.','Think about cost.','Spreadsheet.',15)]),
      week('Git and Linux','Build the command-line and version-control workflow.',['Linux basics','Git workflow','Documentation'],[t('Linux command set','Complete a practical command-line exercise covering files, permissions and processes.','Build CLI confidence.','Text or PDF.'),t('Git workflow','Create a repository and demonstrate branches, commits, merge and a pull request.','Use version control.','Repository URL.',20),t('README','Write a professional README with setup, usage and troubleshooting steps.','Document projects clearly.','Repository URL.',15)]),
      week('CI/CD and containers','Automate a repeatable build and deployment workflow.',['Docker','Pipelines','Testing'],[t('Dockerise an app','Create a Dockerfile for a small application and document how to run it.','Understand containers.','Repository URL.',20),t('CI pipeline','Create a CI workflow that installs dependencies and runs a test or lint step.','Automate quality checks.','Repository URL.',25),t('Deployment plan','Write a deployment plan with environment variables, rollback and release steps.','Think operationally.','PDF.',15)]),
      week('Monitoring and final deployment','Design reliable operations for a small service.',['Observability','Incident response','Release'],[t('Monitoring plan','Define logs, metrics and alerts for the service.','Make systems observable.','PDF.',20),t('Runbook','Create a runbook for five common production incidents.','Prepare for operations.','PDF.',20),t('Final cloud project','Present the architecture, deployment workflow, security controls and monitoring plan as one portfolio project.','Combine the track skills.','PDF + repository URL.',30)]),
    ],
  },
  {
    slug: 'artificial-intelligence', name: 'Artificial Intelligence', icon: 'sparkles',
    shortDescription: 'AI concepts, prompting, data preparation, model evaluation and responsible AI.',
    description: 'A practical AI track focused on understanding AI systems, designing useful workflows, evaluating outputs and building a small applied AI project.',
    skills: ['AI fundamentals', 'Prompt design', 'Data preparation', 'Evaluation', 'Automation', 'Responsible AI'],
    evaluationCriteria: 'Clarity of problem framing, quality of prompts/workflows, evaluation discipline and responsible use of AI.',
    certificateCriteria: 'Complete required tasks and pass the final applied AI project review.',
    weeks: [
      week('AI foundations','Understand AI, ML and generative AI at a practical level.',['AI concepts','Use cases','Limitations'],[t('AI landscape','Explain AI, machine learning, deep learning and generative AI with examples.','Build conceptual foundations.','PDF.'),t('Use-case map','Identify 10 useful AI use cases for a chosen business and classify their risk.','Select appropriate applications.','PDF.',15),t('Limitations review','Analyse hallucination, bias, privacy and reliability risks in an AI workflow.','Use AI responsibly.','PDF.',15)]),
      week('Prompt and workflow design','Create repeatable AI-assisted workflows.',['Prompt structure','Context','Outputs'],[t('Prompt library','Create 10 structured prompts for a chosen role with inputs, constraints and output formats.','Write reliable prompts.','Document.',15),t('Prompt testing','Test two prompt versions against the same examples and compare output quality.','Evaluate prompts.','Spreadsheet + examples.',20),t('Workflow design','Design a multi-step AI workflow with human review checkpoints.','Build controlled workflows.','Diagram.',20)]),
      week('Data and evaluation','Prepare inputs and measure AI output quality.',['Data quality','Rubrics','Evaluation'],[t('Data preparation','Clean and structure a small text dataset for an AI task.','Prepare usable inputs.','CSV or spreadsheet.'),t('Evaluation rubric','Create a 10-point rubric for accuracy, relevance, tone and safety.','Measure output quality.','PDF.',15),t('Evaluation report','Run a small evaluation set and summarise results with examples.','Use evidence to improve systems.','PDF.',25)]),
      week('Applied AI project','Build and document one useful AI-enabled solution.',['Problem solving','Testing','Responsible deployment'],[t('Project brief','Define the user, problem, workflow, inputs and success metrics.','Frame a real problem.','PDF.',15),t('Prototype','Create a working prototype or detailed workflow and test it on sample cases.','Apply AI in practice.','URL or document.',25),t('Final AI report','Document the solution, evaluation results, limitations and responsible-use safeguards.','Present an AI project professionally.','PDF.',30)]),
    ],
  },
  {
    slug: 'human-resources', name: 'Human Resources', icon: 'users',
    shortDescription: 'Recruitment, onboarding, employee experience and HR operations.',
    description: 'A practical HR internship covering job analysis, recruitment, interviews, onboarding and people operations.',
    skills: ['Recruitment', 'Job descriptions', 'Interviewing', 'Onboarding', 'HR documentation', 'Employee experience'],
    evaluationCriteria: 'Professionalism, fairness, clarity of HR documents and practical recruitment/people recommendations.',
    certificateCriteria: 'Complete required tasks and pass the final HR portfolio review.',
    weeks: [
      week('HR foundations','Understand the employee lifecycle and core HR work.',['HR lifecycle','Policies','Employee experience'],[t('Employee lifecycle','Map the journey from hiring to exit and identify HR touchpoints.','Understand HR operations.','PDF.'),t('Policy review','Review five sample HR policies and explain their purpose.','Understand policy basics.','PDF.',15),t('HR checklist','Create a practical HR operations checklist for a small company.','Organise HR work.','Spreadsheet.',15)]),
      week('Recruitment','Build a fair and structured hiring process.',['Job analysis','Sourcing','Screening'],[t('Job analysis','Analyse a role and list responsibilities, skills and success indicators.','Understand a role deeply.','PDF.'),t('Job description','Write a clear, inclusive job description for the role.','Create professional hiring copy.','Document.',15),t('Screening scorecard','Create a structured candidate scorecard with weighted criteria.','Make screening consistent.','Spreadsheet.',20)]),
      week('Interview and onboarding','Design candidate and new-hire experiences.',['Interview questions','Scoring','Onboarding'],[t('Interview guide','Create behavioural and role-specific interview questions with scoring guidance.','Structure interviews.','PDF.',20),t('Interview evaluation','Score three fictional candidates using the same rubric and justify decisions.','Practise evidence-based selection.','Spreadsheet.',20),t('Onboarding plan','Build a 14-day onboarding plan covering people, tools, training and check-ins.','Design a good start.','PDF.',20)]),
      week('HR portfolio','Create a complete mini HR toolkit.',['Documentation','People analytics','Recommendations'],[t('HR dashboard plan','Define five HR metrics and explain how each supports decisions.','Use people data.','PDF.',15),t('Employee experience proposal','Recommend three improvements to a fictional company based on a short survey dataset.','Turn feedback into action.','PDF.',20),t('Final HR portfolio','Combine recruitment, interview, onboarding and HR operations materials into one portfolio.','Show end-to-end capability.','PDF or ZIP.',30)]),
    ],
  },
  {
    slug: 'finance-accounting', name: 'Finance & Accounting', icon: 'calculator',
    shortDescription: 'Bookkeeping basics, financial statements, budgeting and business analysis.',
    description: 'A hands-on finance and accounting track using practical spreadsheets and a small business case.',
    skills: ['Bookkeeping', 'Excel', 'Financial statements', 'Budgeting', 'Ratio analysis', 'Reporting'],
    evaluationCriteria: 'Numerical accuracy, spreadsheet structure, accounting logic and quality of financial interpretation.',
    certificateCriteria: 'Complete required tasks and pass the final finance case review.',
    weeks: [
      week('Accounting foundations','Learn the language and structure of business accounts.',['Accounts','Transactions','Controls'],[t('Accounting glossary','Define 25 accounting terms with simple examples.','Build accounting vocabulary.','PDF.'),t('Transaction exercise','Record a set of fictional transactions using debits and credits.','Practise bookkeeping.','Spreadsheet.',20),t('Control checklist','Create a basic cash and records control checklist for a small business.','Reduce errors.','PDF.',15)]),
      week('Financial statements','Build and interpret core statements.',['Income statement','Balance sheet','Cash flow'],[t('Income statement','Prepare a simple monthly income statement from provided transactions.','Build an income statement.','Spreadsheet.',20),t('Balance sheet','Prepare a simple balance sheet and verify that it balances.','Understand financial position.','Spreadsheet.',20),t('Cash flow summary','Create a cash flow summary and explain the biggest movements.','Understand cash.','Spreadsheet + notes.',15)]),
      week('Budgeting and analysis','Use numbers to support business decisions.',['Budget','Variance','Ratios'],[t('Monthly budget','Create a 12-line operating budget for a fictional business.','Plan spending.','Spreadsheet.',20),t('Variance analysis','Compare actuals to budget and explain five material variances.','Interpret differences.','Spreadsheet.',20),t('Ratio analysis','Calculate and interpret at least six financial ratios.','Assess business performance.','Spreadsheet + PDF.',20)]),
      week('Finance case study','Present a clear financial recommendation.',['Forecasting','Scenario analysis','Reporting'],[t('Forecast','Build a three-month revenue and expense forecast with assumptions.','Forecast performance.','Spreadsheet.',25),t('Scenario analysis','Create base, cautious and growth scenarios and explain key drivers.','Model uncertainty.','Spreadsheet.',20),t('Final finance report','Write an executive report with findings, risks and recommendations.','Communicate financial insight.','PDF.',30)]),
    ],
  },
  {
    slug: 'business-development-sales', name: 'Business Development & Sales', icon: 'briefcase',
    shortDescription: 'Lead generation, prospecting, sales communication, CRM and pipeline management.',
    description: 'A practical sales and business-development internship built around prospect research, outreach, discovery and pipeline reporting.',
    skills: ['Lead generation', 'Prospecting', 'Sales copy', 'Discovery calls', 'CRM', 'Pipeline analysis'],
    evaluationCriteria: 'Research quality, communication, structured sales process and accuracy of pipeline reporting.',
    certificateCriteria: 'Complete required tasks and pass the final sales strategy review.',
    weeks: [
      week('Market and prospect research','Identify a target market and ideal customer profile.',['ICP','Market research','Lead lists'],[t('ICP definition','Define an ideal customer profile with firmographic and behavioural criteria.','Target the right buyers.','PDF.'),t('Market map','Research a market and identify five competitors plus their positioning.','Understand the market.','PDF.',15),t('Lead list','Build a clean list of 25 fictional or publicly available prospects that match the ICP.','Practise prospecting.','Spreadsheet.',20)]),
      week('Outreach','Write professional outreach that earns a response.',['Email','LinkedIn','Personalisation'],[t('Email sequence','Write a three-step outreach sequence for one buyer persona.','Create a repeatable sequence.','Document.',20),t('Personalisation exercise','Personalise five outreach messages using public business context.','Improve relevance.','Document.',15),t('Objection library','Create responses to ten common objections without using misleading claims.','Handle objections professionally.','PDF.',15)]),
      week('Discovery and CRM','Structure discovery and manage opportunities.',['Discovery questions','Qualification','CRM'],[t('Discovery guide','Create a discovery call guide with questions, notes and qualification criteria.','Run structured discovery.','PDF.',20),t('Opportunity stages','Design a six-stage pipeline and define exit criteria for each stage.','Build a useful CRM process.','PDF.',15),t('Pipeline dashboard','Create a spreadsheet showing opportunities, stage, value, next step and expected close date.','Track pipeline.','Spreadsheet.',20)]),
      week('Sales strategy','Turn the work into a complete go-to-market sales plan.',['Pipeline review','Forecast','Strategy'],[t('Pipeline analysis','Analyse the sample pipeline and identify bottlenecks and next actions.','Read pipeline data.','PDF.',20),t('Sales forecast','Build a simple weighted forecast using opportunity stage and probability assumptions.','Forecast responsibly.','Spreadsheet.',20),t('Final sales plan','Present ICP, outreach, qualification, pipeline and 30-day action plan.','Combine the sales workflow.','PDF.',30)]),
    ],
  },
  {
    slug: 'video-editing-content-creation', name: 'Video Editing & Content Creation', icon: 'video',
    shortDescription: 'Storytelling, editing, short-form content, thumbnails and publishing workflows.',
    description: 'A creative four-week track covering scripting, editing, short-form content, visual packaging and a final content package.',
    skills: ['Video editing', 'Storytelling', 'Short-form content', 'Thumbnails', 'Content planning', 'Publishing'],
    evaluationCriteria: 'Story clarity, editing quality, pacing, visual consistency and ability to meet a creative brief.',
    certificateCriteria: 'Complete required tasks and pass the final content portfolio review.',
    weeks: [
      week('Story and scripting','Plan content before opening the editor.',['Audience','Story structure','Scripts'],[t('Audience brief','Define audience, topic, platform and desired action for a content series.','Create with purpose.','PDF.'),t('Short script','Write a 60-90 second script with hook, value and CTA.','Structure short-form content.','Document.',15),t('Shot list','Create a shot list and edit plan for the script.','Plan production.','PDF.',15)]),
      week('Editing fundamentals','Create a clean, watchable edit.',['Cuts','Audio','Captions'],[t('Cutting exercise','Edit a short clip using clean cuts, pacing and basic transitions.','Learn core editing.','MP4.',20,{submissionType:'file'}),t('Audio and captions','Improve dialogue clarity, add captions and balance background audio.','Polish accessibility and sound.','MP4.',20,{submissionType:'file'}),t('Editing notes','Write a before/after reflection explaining five editing decisions.','Develop editing judgement.','PDF.')]),
      week('Short-form content','Package content for social platforms.',['Hooks','Vertical format','Thumbnails'],[t('Three hooks','Create three alternative hooks for the same topic and explain the intended audience response.','Improve retention.','Document.'),t('Vertical video','Produce a 30-60 second vertical video with captions and strong pacing.','Create platform-ready content.','MP4.',25,{submissionType:'file'}),t('Thumbnail set','Design three thumbnail concepts with clear hierarchy and readable text.','Improve visual packaging.','Images or PDF.',15)]),
      week('Content portfolio','Deliver a cohesive mini content campaign.',['Consistency','Publishing','Portfolio'],[t('Content calendar','Create a 7-day content calendar with formats, topics, hooks and CTAs.','Plan publishing.','Spreadsheet.',15),t('Content package','Produce three finished pieces that share a consistent visual identity.','Show consistency.','ZIP or URLs.',25,{submissionType:'file_or_url'}),t('Final portfolio','Present the work, creative rationale, metrics to track and next-step recommendations.','Build a professional portfolio.','PDF + URLs.',30,{submissionType:'file_or_url'})]),
    ],
  },
];


