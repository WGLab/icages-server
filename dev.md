### result json specification

```
<Result> {
  Output: list of <GeneInfo>
  Log: {
    Gene_count: integer
    Driver_count: integer
    CGC_count: integer
    KEGG_count: integer
    Missense_count: integer
    Noncoding_count: integer
    Structural_variation_count: integer
    Drug_count: integer
  }
}

<GeneInfo> {
  Gene_url: string
  Name: string
  Category: string
  Driver: boolean
  Phenolyzer_score: float
  iCAGES_gene_score: float
  Mutation: list of <MutationInfo>
  Children: list of <DrugInfo>
}

<MutationInfo> {
  Chromosome: string
  Start_position: integer
  End_position: integer
  Reference_allele: string
  Alternative_allele: string
  Mutation_syntax: string
  Protein_syntax: string
  Mutation_category: string
  Score_category: string
  Driver_mutation_score: string
}

<DrugInfo> {
  Drug_name: string
  Final_target_gene: string
  Direct_target_gene: string
  BioSystems_probability: float
  iCAGES_drug_score: float
}
```
