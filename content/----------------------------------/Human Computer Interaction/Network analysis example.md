---
cssclasses:
  - "[[Human Computer Interaction]]"
  - "[[Statistics]]"
aliases:
  - Network
  - Analysis
tags:
  - Essay
---
###### Disclaimer
The EBICglasso network analysis imply that the data are normally distributed. Our data is not normally distributed despite the LOG transformation. Thus we should not report this section.

Network analysis is a method for modeling interactions between large numbers of variables. Instead of trying to reduce the structure of the variables to their shared information, as is done in latent variable modeling, we estimate the relation between all variables directly. 

Most of the analyses shown are based on the bootnet package in R (Epskamp, Borsboom, & Fried, 2017). The network graphs that JASP produces are based on the R package qgraph (Epskamp, et al,. 2012).

In network analysis jargon, we will refer to the observed variables as nodes and to the estimated relations between variables as edges. The nodes are positioned using the Fruchterman-Reingold algorithm which organizes the network based on the strength of the connections between nodes.

The Centrality plot two of the three definitions of the centrality measures depend on the shortest paths of the network. A shortest path is the minimum number of steps you need to take to get from one node to another one. Of course, you cannot go from one node to the next if the edge between them is missing. Edges are missing whenever their estimated value is zero. In this network an edge of zero implies a correlation of zero but that can differ across network estimators. The shortest paths are often computed for all nodes, to all other nodes.

Betweenness attempts to capture the node’s role as a connector between other groups of nodes. Thus betweenness, inference how critical a node is in the network when it functions as a bridge quantifying the number of times a node acts as a bridge along the shortest path between two other nodes. For instance, the betweenness of the node Concentration of Attention (SA5) is relatively high compared to Arousal (SA4). This means that there are more shortest paths that pass through Concentration of Attention (SA5) than through Arousal (SA4).

Secondly, closeness defines the inverse of the sum of all shortest paths from the node of interest to all other nodes (Catalá-López et al., 2016). Thus, the more central a node is, the lower its total distance to all other nodes. In other words, closeness seeks to capture how close a node is to any other node in the network, i.e., how quickly or easily the node reaches the others. 

Third, we have the node’s strength, which defines its degree of significance within its local environment. Therefore instead of glancing at the number of connections that a node might have, it is more interesting to assess how the value of those connections is.

And least, the expected influence describes how significant the node is based on substantial connection. 

To interpret the data more accessible instead of showing the correlation network, which will display some noise, we present the EBICglasso network (Extended Bayesian Information Criterion Graphical Least Absolute Shrinkage and Selection Operator). Thus, the edge weights are slightly biased compared to the person’s correlation values (Foygel & Drton, 2010; Friedman, Hastie, & Tibshirani, 2008; Friedman, Hastie, & Tibshirani, 2014). 

Having discussed the methodology hereafter, we interpret the EBICglasso network. Perhaps the most striking observation is the large variance within nodes that are supposed to belong to the same group, in particular for SA. If we take for example node SA3, we see that it has a very low Betweenness and Degree, whereas those centrality measures are much higher for node SA2. Another observation is that the indicators of CL are close, and seems to relate positively to another. We also see that some groups are more closely related to each other than other groups.

###### MIMIC Model

The MIMIC model we developed is based on Yves Rosseel’s great R package lavaan (Rosseel, 2012). The model shows latent, unmeasured, variables (Y) as circles and observed variables as rectangles.

The MIMIC model has been used as we were interested in (1) identifying factors that are measured by multiple indicators and (2) examining predictors that cause those factors. The MIMIC model, on the one hand, multiple indicators measure a latent variable of interest, on the other hand, the causes that are assumed to predict the latent variable.

In our analysis we were interested in investigating the effects of sub-dimensions of the SART questioner in predicting Y. Here, Y cannot be measured directly. It is therefore operationalized as a latent variable measured by: Instability of the situation (SA1), Complexity of the situation (SA2), Variability of the situation (SA3), Arousal (SA4), Concentration of Attention (SA5), Division of Attention (SA6). Six variables, SA1 to 6 are (multiple) indicators of Y. The other variable, Mental Demand (CL1) is the cause of Y.

The table of Predictor coefficients shows us how much each predictor predicts Y. In particular the predictor coefficient of Mental Demand (CL1) is estimated as 0.862. With every unit increase of Mental Demand, Y increases by 0.862 units. Assuming that Y is a normally distributed variable with a variance of 1, we can we this as a strong effect at most. Note that only the effects of Mental Demand is statistically significant, assuming an alpha-level of 0.05.

Next, the table of Indicator coefficients provides the factor loadings. With a one-unit increase in Y, Instability of the situation (SA1) increases by 0.62 units. Next, with a one unit increase in Y, Complexity of the situation (SA2) increase by 0.866 units. So does Variability of the situation (SA3) by 0.589, Arousal (SA4) by 0.747, Concentration of Attention (SA5) by 0.799, and lastly Division of Attention (SA6) by 0.824.
 The R-squared table displays the proportion of explained variance by the latent factor in each of the indicator variables. In this case, 38.4% of the variance in SA1, 75.1% of the variance in SA2, 34.7% of the variance in SA3, 55.8% of the variance in SA4, 63.9% of the variance in SA5, and 68% of the variance in SA6, was explained by the latent Y factor respectively.

So far, we have interpreted the coefficients from the output. We can also check whether our MIMIC model fits the data well, in general. In the chi-square test of model fit, we reject our fitted model in favor of the saturated model if the p-value is lower than 0.05. According to the table of Chi Square test, the p-value of the Factor model is not significant although the p-value is slightly under 0.05. Therefore, we can say the model fits the data. 

To corroborate Chi Square test we considered the Comparative Fit Index (CFI), Tucker-Lewis Index (TLI), Root mean square error of approximation (RMSEA) and Standardized root mean square residual (SRMR). The respective values of CFI and TLI are 0.924 and 0.887. These values are greater than or close to 0.90, which indicates an appropriate model fit. For RMSEA and SRMR, the values are 0.15 and 0.063, respectively. Note the value of RMSEA is above to 0.05 however that of SRMR is lower than 0.08, our model has a moderate fit to the data.

In the Path Plot finally, the values at each arrow express the predictor coefficients, the indicator coefficients, the variance and covariance among predictors, the variance of social participation (denoted as Y), and the measurement error variances of indicators.

###### Process Analysis

The analysis was pre-registered, and the dataset includes a relatively large sample size (N = 32) by the standards of Human-Computer Interaction research (Caine, 2016). Within the theoretical framework guiding this study, Mental Demand (CL1) and Effort (CL5) are treated as exogenous outcome variables. This assumption is grounded in the task structure and the temporal ordering of measures: CL1 and CL5 reflect subjective workload evaluations that are collected after exposure to task conditions and are not expected to causally influence the perceptual or situational variables under investigation. As such, it is hypothesized that Complexity of the Situation (SA2), Arousal (SA4), and Concentration of Attention (SA5) exert directional effects on these outcomes. This conceptual ordering enables the identification of causal paths consistent with prior models of cognitive workload and attentional demands in applied HCI contexts.

###### Discussion

As emphasized by Rohrer et al. (2021), process models must be interpreted cautiously, as they rely on strong assumptions about the appropriateness of the chosen model structure for accurately identifying causal relationships. While PROCESS analyses allow us to test whether the observed data are consistent with the specified causal structure, other critical assumptions remain much harder to verify. For instance, all potential confounding variables must be included in the model to correctly estimate causal effects. However, fully accounting for all confounders is particularly challenging for indirect effects—even in controlled experiments—as unobserved variables can bias the estimated causal paths from mediators to dependent variables (Bullock et al., 2010; Rohrer et al., 2021).

Another common difficulty is accurately establishing the directionality of causal relationships and confidently excluding alternative causal explanations (Kline, 2012; Rohrer et al., 2021; Fiedler et al., 2018). In our specific example, however, the causal direction from sub-dimensions of the NASA-TLX to the SART questionnaire was straightforwardly justified through theoretical reasoning.

Although the statistical models presented suggest directional relationships between variables, causality ultimately remains inferential, based on existing theoretical frameworks rather than empirical certainty. Therefore, to conclusively validate the identified causal directions, experimental manipulations or controlled interventions would be essential. Furthermore, adjustments made due to model misspecifications were approached cautiously. While these modifications were exploratory, they were consistently aligned with theoretical expectations. Nonetheless, validation with independent datasets remains ideal to ensure the robustness and generalizability of our conclusions.

REFERENCES

Bullock, J. G., Green, D. P., & Ha, S. E. (2010). Yes, but what’s the mechanism? (don’t expect an easy answer). Journal of Personality and Social Psychology, 98(4), 550–558. https://doi.org/10.1037/a0018933

Rohrer, J. M., & Arslan, R. C. (2021). Precise answers to vague questions: Issues with interactions. Advances in Methods and Practices in Psychological Science, 4(2), 25152459211007368. https://doi.org/10.1177/25152459211007368

Kline, R. B. (2012). Assumptions in structural equation modeling. In R. H. Hoyle (Ed.), Handbook of structural equation modeling (pp. 111–125). Guilford Press.

Fiedler, K., Harris, C., & Schott, M. (2018). Unwarranted inferences from statistical mediation tests – An analysis of articles published in 2015. Journal of Experimental Social Psychology, 75, 95–102. https://doi.org/10.1016/j.jesp.2017.11.008

Caine, K. (2016). Local Standards for Sample Size at CHI. Proceedings of the 2016 CHI Conference on Human Factors in Computing Systems, 981–992. https://doi.org/10.1145/2858036.2858498

Rosseel, Y. (2012) lavaan: An R Package for Structural Equation Modeling. Journal of Statistical Software, 48(2), 1-36. http://www.jstatsoft.org/v48/i02/

Epskamp, S., Borsboom, D., & Fried, E. I. (2017). Estimating psychological networks and their accuracy: a tutorial paper. Behavior Research Methods.
Epskamp, S., Cramer, A. O., Waldorp, L. J., Schmittmann, V. D., & Borsboom, D. (2012). qgraph: Network visualizations of relationships in psychometric data. Journal of Statistical Software, 48(4), 1-18.

Li, L., Catalá-López, F., Alonso-Arroyo, A., Tian, J., Aleixandre-Benavent, R., Pieper, D., Long, G., Yao, L., Wang, Q., & Yang, K. (2016). The Global Research Collaboration of Network Meta-Analysis: A Social Network Analysis. PLoS One, 11(9), e0163239.

Foygel, R., & Drton, M. (2010). Extended Bayesian information criteria for Gaussian graphical models. In Advances in neural information processing systems (pp. 604-612).

Friedman, J., Hastie, T., & Tibshirani, R. (2008). Sparse inverse covariance estimation with the graphical lasso. Biostatistics, 9(3), 432-441.

Friedman, J. H., Hastie, T., & Tibshirani, R. (2014). glasso: Graphical lasso estimation of gaussian graphical models. Retrieved from https://CRAN.R-project.org/package=glasso