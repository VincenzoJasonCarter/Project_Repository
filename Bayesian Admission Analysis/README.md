# Bayesian Beta Regression: Probabilistic Modeling of University Admission Chances

This repository contains the materials for my **Bayesian Beta Regression** project, conducted as part of the *LC09 Bayesian Data Analysis* course at **Bina Nusantara University**.

## 📘 Overview
The project aims to model and predict students' **Chance of Admit** using Bayesian Beta Regression — a probabilistic approach suitable for continuous outcomes constrained between 0 and 1.

The analysis compares the effects of **GRE Score, TOEFL Score, University Rating, SOP, LOR, CGPA, and Research Experience** on admission probabilities.

## 📊 Dataset
The dataset consists of **500 student records** with 8 variables:

| Variable | Description |
|-----------|-------------|
| GRE.Score | Graduate Record Exam score |
| TOEFL.Score | TOEFL test score |
| University.Rating | Rating of the target university |
| SOP | Statement of Purpose strength |
| LOR | Letter of Recommendation strength |
| CGPA | Undergraduate GPA |
| Research | Research experience (0 = No, 1 = Yes) |
| Chance.of.Admit | Target variable (0–1 range) |

## 🧠 Model
- Implemented using **JAGS** (via R)  
- **Normal(0, 10^-6)** priors for regression coefficients  
- **Gamma(0.001, 0.001)** prior for precision parameter  
- Diagnostics: Geweke, Gelman-Rubin, Raftery-Lewis, Effective Sample Size  
- Model Evaluation: WAIC, LOO-CV, Posterior Predictive Checks  

## 📈 Results
- CGPA and GRE Score were the strongest predictors of admission likelihood.  
- MSE = **0.0034**, PPP-value = **0.45**, indicating good model fit.  
- Achieved full convergence across chains (R-hat ≈ 1.00).

## 📚 Files
- `BayesianBetaRegression.pdf` — Full report  
- `FinalProject_Take2.Rmd` — Analysis code  
- `admission_data.csv` — Dataset used in the study  

## 🧾 Citation
*Carter, Vincenzo Jason et al. (2025).*  
**Analyzing Graduation Admission Data Using Bayesian Beta Regression: A Probabilistic Approach.**  
Bina Nusantara University, School of Computer Science.

---

💡 *To run the analysis:*
```r
# In RStudio
library(rjags)
rmarkdown::render("FinalProject_Take2.Rmd")

