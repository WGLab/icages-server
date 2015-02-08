### result json specification

```
<Result> {
  output: list of <GeneInfo>
  log: {
    genecount: integer
    drivercount: integer
    cgccount: integer
    keggcount: integer
    missensecount: integer
    structuralcount: integer
    drugcount: integer
  }
}

<GeneInfo> {
  gene: string
  mutation: list of <MutationInfo>
  phenolyzer: float
  icages: float
  category: string
  url: string
  driver: boolean
  childern: list of <DrugInfo>
}

<MutationInfo> {
  mutation_syntax: string
  protein_syntax: string
  radial: float
}

<DrugInfo> {
  drug: string
  score: float
}
```
