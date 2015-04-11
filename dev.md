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
  Target_mutation_tag: boolean
  Children: list of <TargetMutationInfo> # if Target_mutation_tag is TRUE
  FDA_tag: boolean 
  FDA_Info: <FDAInfo> # if FDA_tag is TRUE
  CT_tag: boolean
  CT_Children: list of <CTInfo> # if CT_tag is TRUE
}

<TargetMutationInfo> {
  Target_mutation: string
  Rating: float
}

<FDAInfo> {
  Status: string
  Active_ingredient: string
}

<CTInfo> {
  Name: string
  Organization: string
  Phase: string
  URL: string
}


```

### Front-end data structure specification
```
geneRows: list of <GeneRow>

<GeneRow> {
  otherFields: list of string
  firstRow: boolean
  hasDrug: boolean
  drugs: list of <DrugInfo>
  rowspan: integer
  mutation: <MutationInfo>
  url: string
}

availableDrugs: list of <DrugInfo> //each with an extra field isAccordionOpen

```



### Config files

##### icages_config.json

all the paths have to end with a "/"


