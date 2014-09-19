#!/usr/bin/perl
use strict;
use warnings;
use List::Util qw(min max);	
use Pod::Usage;
use Getopt::Long;

######################################################################################################################################
########################################################### This is iCAGES! ##########################################################
######################################################################################################################################



######################################################################################################################################
######################################################## variable declaration ########################################################
######################################################################################################################################

my ($inputFile, $outputFile, $gene, $icages, $annovarLog);                                          #ANNOVAR files
my ($annovarCommand, $callConvertToAnnovar, $callAnnovar);                                          #ANNOVAR commands
my ($icagesDB, $icagesIndex, $refGeneDB, $refGeneIndex, $dbsnpDB, $dbsnpIndex);                     #ANNOVAR DB files: iCAGES score (index), refGene (fasta), dbSNP
my ($formatCheckFirstLine, $iNotmissense, $iMissense, $iDriver, $iKegg, $iCgc);                     #ANNOVAR checking: format, missense mutations,


my ($huiDB, $cgcDB, $keggDB);                                                                       #iCAGES DB files: Phenolyzer score, cgc genes, kegg cancer pathway genes
my ($help, $percent, $manual, $downloadDB, $id);                                                    #iCAGES arguments
my ($txt, $json, $log);                                                                             #iCAGES output files
my @log;                                                                                            #iCAGES log content

my $perlCommand;                                                                                    #SYSTEM commands
my ($icagesLocation, $inputLocation, $outputLocation, $DBLocation, $tempLocation, $logLocation);    #SYSTEM locations
my $nowString = localtime;                                                                          #SYSTEM local time

my %radialSVM;                                                                                      #HASH mutation->radialSVM
my %icages;                                                                                         #HASH geneName->[0]icages(total), [1]icages(highest)
my %hui;                                                                                            #HASH geneName->hui
my %kegg;                                                                                           #HASH geneName->kegg
my %cgc;                                                                                            #HASH geneName->1
my %icages_txt;                                                                                     #HASH geneName->mutation->information

my ($minHui, $maxHui);                                                                              #MIN/MAX for Phenolyzer scores
my ($minGene, $maxGene);                                                                            #MIN/MAX for iCAGES score for all genes (for normalization purpose)

my $geneNumber;                                                                                     #JSON number of genes
my $iGene;                                                                                          #JSON current number of genes (line control for reaching end of json file)

my (@radialSVMUnsort, @radialSVMSort);                                                              #PERCENT sort mutations according to radial SVM score (small to large)

my $givenPercentagePosition;                                                                        #PERCENT length of all mutations with highest radial SVM score in each gene
my $givenPercentageRadialSVM;                                                                       #PERCENT radial SVM score at given percentile



######################################################################################################################################
######################################################## argument processing #########################################################
######################################################################################################################################

processArguments ();                                                                                #process program arguments, set up default values, check for errors and check for existence of db files
sub processArguments {
    GetOptions( 'help|h' => \$help,
                'percent|p=f' => \$percent,
                'manual|man|m' => \$manual,
                'downloadDB|d' => \$downloadDB,
                'id|i=i' => \$id
                )or pod2usage ();
    
    
    
    
    ######################################################################################################################################
    ######################################################## file download (optional) ####################################################
    ######################################################################################################################################
    
    if($downloadDB){
        
        ################# commnad locations ######################
        $perlCommand = "$0";
        $perlCommand =~ /(.*)icages\.pl/;
        $icagesLocation = $1;
        $DBLocation = $icagesLocation. "db/";

        ######################## databases #######################
        $huiDB = $DBLocation . "phenolyzer.score";
        $cgcDB = $DBLocation . "cgc.gene";
        $keggDB = $DBLocation . "kegg.gene";
        $icagesDB = $DBLocation . "hg19_iCAGES.txt";
        $icagesIndex = $DBLocation . "hg19_iCAGES.idx";
        $refGeneDB = $DBLocation . "hg19_refGene.txt";
        $refGeneIndex = $DBLocation . "hg19_refGeneMrna.fa";
        $dbsnpDB = $DBLocation . "hg19_snp138.txt";
        $dbsnpIndex = $DBLocation . "hg19_snp138.txt.idx";
        
        unless(-e "$cgcDB"){
            !system("wget -O $cgcDB http://icages.usc.edu:5000/download/icages/db/cgc.gene") or die "ERROR: cannot download database file $cgcDB\n";
        }
        
        unless(-e "$keggDB"){
            !system("wget -O $keggDB http://icages.usc.edu:5000/download/icages/db/kegg.gene") or die "ERROR: cannot download database file $keggDB\n";
        }
        
        unless(-e "$huiDB"){
            !system("wget -O $huiDB http://icages.usc.edu:5000/download/icages/db/phenolyzer.score") or die "ERROR: cannot download database file $huiDB\n";
        }
        
        unless(-e "$icagesDB"){
            !system("wget -O $icagesDB http://icages.usc.edu:5000/download/icages/db/hg19_iCAGES.txt") or die "ERROR: cannot download database file $icagesDB\n";
        }
        
        unless(-e "$icagesIndex"){
            !system("wget -O $icagesIndex http://icages.usc.edu:5000/download/icages/db/hg19_iCAGES.idx") or die "ERROR: cannot download database file $icagesIndex\n";
        }
        
        unless(-e "$refGeneDB"){
            !system("wget -O $refGeneDB http://icages.usc.edu:5000/download/icages/db/hg19_refGene.txt") or die "ERROR: cannot download database file $refGeneDB\n";
        }
        
        unless(-e "$refGeneIndex"){
            !system("wget -O $refGeneIndex http://icages.usc.edu:5000/download/icages/db/hg19_refGeneMrna.fa") or die "ERROR: cannot download database file $refGeneIndex\n";
        }
        
        unless(-e "$dbsnpDB"){
            !system("wget -O $dbsnpDB http://icages.usc.edu:5000/download/icages/db/hg19_snp138.txt") or die "ERROR: cannot download database file $dbsnpDB\n";
        }
        
        unless(-e "$dbsnpIndex"){
            !system("wget -O $dbsnpIndex http://icages.usc.edu:5000/download/icages/db/hg19_snp138.txt.idx") or die "ERROR: cannot download database file $dbsnpIndex\n";
        }
    }else{
    

    
    ######################## arguments ########################
    $percent=80 unless $percent;                                                                    #default value of percent
    $help and pod2usage (-verbose=>1, -exitval=>1, -output=>\*STDOUT);
    $manual and pod2usage (-verbose=>2, -exitval=>1, -output=>\*STDOUT);
    @ARGV == 4 or pod2usage ();
    
    ################### configure file ########################

    $inputLocation = $ARGV[0];
    $outputLocation = $ARGV[1];
    $tempLocation = $ARGV[2];
    $logLocation = $ARGV[3];
    $inputLocation = $1 if $ARGV[0] =~ /(.*)\/$/;
    $outputLocation = $1 if $ARGV[1] =~ /(.*)\/$/;
    $tempLocation = $1 if $ARGV[2] =~ /(.*)\/$/;
    $logLocation = $1 if $ARGV[3] =~ /(.*)\/$/;
    
    ################# commnad locations ######################
    $perlCommand = "$0";
    $perlCommand =~ /(.*)icages\.pl/;
    $icagesLocation = $1;
    $DBLocation = $icagesLocation. "db/";
    
    #################### icages files #########################
    $inputFile = $inputLocation . "/input-". $id . ".txt";
    $txt = $outputLocation . "/result-". $id . ".txt";
    $json = $outputLocation . "/result-". $id . ".json";
    $log = $logLocation . "/log-" . $id . ".log";
  
    ####################### ANNOVAR ##########################
    $annovarCommand = $icagesLocation . "bin/annovar";
    $callConvertToAnnovar = $annovarCommand . "/convert2annovar.pl";
    $callAnnovar = $annovarCommand . "/annotate_variation.pl";
    $outputFile = $tempLocation ."/input-" .$id . ".annovar";                                       #define temp files for running ANNOVAR
    $gene = $outputFile . ".exonic_variant_function";                                               #genes annotation from ANNOVAR
    $icages = $outputFile . ".hg19_iCAGES_dropped";                                                 #radial SVM score for each mutation
    $annovarLog = $outputFile .".log";

    ######################## databases #######################
    $huiDB = $DBLocation . "phenolyzer.score";
    $cgcDB = $DBLocation . "cgc.gene";
    $keggDB = $DBLocation . "kegg.gene";
    $icagesDB = $DBLocation . "hg19_iCAGES.txt";
    $icagesIndex = $DBLocation . "hg19_iCAGES.idx";
    $refGeneDB = $DBLocation . "hg19_refGene.txt";
    $refGeneIndex = $DBLocation . "hg19_refGeneMrna.fa";
    $dbsnpDB = $DBLocation . "hg19_snp138.txt";
    $dbsnpIndex = $DBLocation . "hg19_snp138.txt.idx";
    
    
    ######################## checking files #######################
    open(IN, "$inputFile") or die "iCAGES: cannot open input file $inputFile\n";
    open(CGC, "$cgcDB") or die "iCAGES: cannot open database file $cgcDB. if you do not have this file in your .db/ folder, please download them using: icages.pl -downloadDB\n";
    open(KEGG, "$keggDB") or die "iCAGES: cannot open database file $keggDB. if you do not have this file in your .db/ folder, please download them using: icages.pl -downloadDB\n";
    open(HUI, "$huiDB") or die "iCAGES: cannot open database file $huiDB. if you do not have this file in your .db/ folder, please download them using: icages.pl -downloadDB\n";
    die "ERROR: cannot open database file $icagesDB. if you do not have this file in your .db/ folder, please download them using: icages.pl -downloadDB\n" unless -e $icagesDB ;
    die "ERROR: cannot open index file $icagesIndex. if you do not have this file in your .db/ folder, please download them using: icages.pl -downloadDB\n" unless -e $icagesIndex ;
    die "ERROR: cannot open database file $refGeneDB. if you do not have this file in your .db/ folder, please download them using: icages.pl -downloadDB\n" unless -e $refGeneDB ;
    die "ERROR: cannot open database file $refGeneIndex. if you do not have this file in your .db/ folder, please download them using: icages.pl -downloadDB\n" unless -e $refGeneIndex ;
    die "ERROR: cannot open database file $dbsnpDB. if you do not have this file in your .db/ folder, please download them using: icages.pl -downloadDB\n" unless -e $dbsnpDB ;
    die "ERROR: cannot open database file $dbsnpIndex. if you do not have this file in your .db/ folder, please download them using: icages.pl -downloadDB\n" unless -e $dbsnpIndex ;
    }
}



######################################################################################################################################
######################################################## format convert ##############################################################
######################################################################################################################################


$formatCheckFirstLine = <IN>;

print "NOTICE: start runing iCAGES packge at $nowString\n";
print "NOTICE: start input file format checking and converting format if needed\n";
push (@log, "iCAGES: start runing iCAGES packge at $nowString");
push (@log, "iCAGES: start input file format checking and converting format if needed");

chomp $formatCheckFirstLine;
close IN;

if($formatCheckFirstLine =~ /^##fileformat=VCF/){                                                               #VCF
    !system("$callConvertToAnnovar -format vcf4 $inputFile > $outputFile") or die "ERROR: cannot execute convert2annovar.pl for converting VCF file\n";
}else{                                                                                                          #ANNOVAR
    !system("cp $inputFile $outputFile") or die "ERROR: cannot use input file $inputFile\n";
}


######################################################################################################################################
######################################################## running ANNOVAR #############################################################
######################################################################################################################################



print "NOTICE: start to run ANNOVAR index function to fetch radial SVM score for each mutation \n";
push (@log, "iCAGES: start to run ANNOVAR index function to fetch radial SVM score for each mutation");
!system("$callAnnovar -filter -out $outputFile -build hg19 -dbtype iCAGES $outputFile $DBLocation") or die;

print "NOTICE: start annotating each mutaiton using ANNOVAR\n";
push (@log, "iCAGES: start annotating each mutaiton using ANNOVAR");
!system("$callAnnovar -out $outputFile -build hg19 $outputFile $DBLocation") or die;


######################################################################################################################################
######################################################## loading database ############################################################
######################################################################################################################################


###################### cgc ###########################
push (@log, "iCAGES: start loading Cancer Gene Census data");
print "NOTICE: start loading Cancer Gene Census data\n";

while(<CGC>){
    chomp;
    my @line;
    @line = split;
    $cgc{$line[0]} = 1;
}


###################### kegg ##########################
push (@log, "iCAGES: start loading KEGG Cancer Pathway gene data");
print "NOTICE: start loading KEGG Cancer Pathway gene data\n";

while(<KEGG>){
    chomp;
    my @line;
    @line = split;
    $kegg{$line[0]} = $line[1];
}


################### Phenolyzer #######################
push (@log, "iCAGES: start extracting Phenolyzer score for each gene");
print "NOTICE: start extracting Phenolyzer score for each gene\n";


$minHui = 1;
$maxHui = 0;

while(<HUI>){
    chomp;
    my @line;
    @line = split(/\t/, $_);
    $hui{$line[0]} = $line[1];
    $maxHui = max($line[1], $maxHui);                                   #maxHui means the largest score in hui
    $minHui = min($line[1], $minHui);
}





######################################################################################################################################
################################################ processing ANNVOAR output ###########################################################
######################################################################################################################################




open(TXT, ">$txt") or die "ERROR: cannot open file $txt\n";
open(JSON, ">$json") or die "ERROR: cannot open file $json\n";
open(GENE, "$gene") or die "ERROR: cannot open file $gene\n";
open(ANNLOG, "$annovarLog") or die "ERROR: cannot open file $annovarLog\n";
open(RADIAL, "$icages") or die "ERROR: cannot open file $icages\n";
open(LOG, ">$log") or die "ERROR: cannot open file $log\n";

############# log and print to iCAGES ##############
while(<ANNLOG>){
    chomp;
    push (@log, $_);
}

for(0..$#log){
    print LOG "$log[$_]\n";
}


############### radial SVM score ###################

print LOG "iCAGES: start extracting radial SVM score for each mutation from ANNOVAR OUTPUT\n";
print "NOTICE: start extracting radial SVM score for each mutation from ANNOVAR OUTPUT\n";

while(<RADIAL>){
    chomp;
    my @line;
    my $key;
    @line = split(/\t/, $_);
    $key = "$line[2]:$line[3]:$line[5]:$line[6]";
    $radialSVM{$key} = $line[1];
}



############### gene annotation ###################

print LOG "iCAGES: start parsing gene annotation files generated from ANNOVAR output\n";
print "NOTICE: start parsing gene annotation files generated from ANNOVAR output\n";


while(<GENE>){
    chomp;
    my @line;
    my $key;                                                            #hash key used for fetch radial SVM score from %radialSVM: mutation->radialSVM
    my $gene;
    my ($mutationSyntax, $proteinSyntax);
    @line = split(/\t/, $_);
    if ($line[1] eq "nonsynonymous SNV"){
        $key = "$line[3]:$line[4]:$line[6]:$line[7]";
        $gene = $line[2];
        $mutationSyntax = $line[2];
        $proteinSyntax = $line[2];
        $proteinSyntax =~ /:(p\.[\w|\d]+?),/;
        $proteinSyntax = $1;
        $mutationSyntax =~ /:c\.([\w])([\d]+)(\w):/;
        $mutationSyntax = "c.$2$1>$3";
        $gene =~ /^([\w|\d]+?):/;
        $gene = $1;
        next unless defined $gene;
        $mutationSyntax = "\"NA\"" unless defined $mutationSyntax;
        $proteinSyntax = "\"NA\"" unless defined $proteinSyntax;
        $radialSVM{$key} = "\"NA\"" unless exists $radialSVM{$key};
        if(exists $icages{$gene}[0] and exists $radialSVM{$key}){
            $icages{$gene}[0] = $icages{$gene}[0] + $radialSVM{$key};
            $icages{$gene}[1] = max($icages{$gene}[1], $radialSVM{$key});
        }elsif(exists $radialSVM{$key}){
            $icages{$gene}[0] = $radialSVM{$key};
            $icages{$gene}[1] = $radialSVM{$key};
        }else{
            $icages{$gene}[0] = 0;
            $icages{$gene}[1] = 0;
        }
        $iMissense ++;
        $icages_txt{$gene}{$key} = "$mutationSyntax\t$proteinSyntax\t$radialSVM{$key}";
    }else{
        $iNotmissense ++;
    }
}


print LOG "iCAGES: WARNING! only missense mutations are used in iCAGES. Your data contain $iNotmissense none missense mutations and they are not processed by iCAGES\n" if $iNotmissense > 0;
print "NOTICE: WARNING! only missense mutations are used in iCAGES. Your data contain $iNotmissense none missense mutations and they are not processed by iCAGES\n" if $iNotmissense > 0;

############### multiply Phenolyzer score ###################
print LOG "iCAGES: start multiplying radial SVM score from each mutation with Phenolyzer score\n";
print "NOTICE: start multiplying radial SVM score from each mutation with Phenolyzer score\n";

foreach my $key (keys %icages){
    if(exists $hui{$key} ){
        $icages{$key}[0] = $icages{$key}[0]*$hui{$key};
        $icages{$key}[1] = $icages{$key}[1]*$hui{$key};
    }else{
        $icages{$key}[0] = $icages{$key}[0]*rand($minHui);
    	$icages{$key}[1] = $icages{$key}[1]*rand($minHui);
    }
    push @radialSVMUnsort, $icages{$key}[1];
}


############### rank mutaitons and get candidate genes ###################

print LOG "iCAGES: start filtering genes whose most deleterious mutation ranks above top $percent percent\n";
print "NOTICE: start filtering genes whose most deleterious mutation ranks above top $percent percent\n";

@radialSVMSort = sort {$a <=> $b} @radialSVMUnsort;
$givenPercentagePosition = int(($#radialSVMSort + 1) * $percent/100);                  #percentage for ranking genes
$givenPercentageRadialSVM = $radialSVMSort[$givenPercentagePosition];
$maxGene = -1;
$minGene = 1;


foreach my $key (keys %icages){
    if($icages{$key}[1] >= $givenPercentageRadialSVM){
	    $icages{$key}[1] = "true";
	    
    }else{
	    $icages{$key}[1] = "false";
    }
    $geneNumber++;
    $minGene = min($minGene, $icages{$key}[0]);                             # highest and lowest score in gene for normalization
    $maxGene = max($maxGene, $icages{$key}[0]);
}



#################### generating final output ##########################

print LOG "iCAGES: start generating output\n";
print "NOTICE: start generating output\n";

$iGene = 0;


print TXT "GeneName\tMutationSyntax\tProteinSyntax\tRadialSVMScore\tPhenolyzerSocre\tiCAGESScore\tCategory\tURL\tDriver?\n";
print JSON "[\n";

if($maxGene-$minGene > 0){
	foreach my $key (sort { $icages{$b}[0] <=> $icages{$a}[0] } keys %icages){              #loop to get information for each gene
        my @mutationCountEachGene;
        my $mutationCountEachGene;
        my $genePrintTXTInfor;
        my $genePrintJSONInfor;
        my $iMutation;
        my $mutationSyntax;
        my $proteinSyntax;
        my $radial;
        $mutationSyntax = "";
        $proteinSyntax="";
        $radial = 0;
	    $hui{$key} = "\"NA\"" unless exists $hui{$key};
	    @mutationCountEachGene = keys %{$icages_txt{$key}};
	    $mutationCountEachGene = $#mutationCountEachGene + 1;
        $iMutation=0;
        $icages{$key}[0] = ($icages{$key}[0] - $minGene)/($maxGene-$minGene);
    	$iGene++;
        
        ############ loop to get information for each mutation ############
        
	    foreach my $geneKey (sort keys %{$icages_txt{$key}}){
            my @infor;
            my $tempMutationSyntax;
            my $tempProteinSyntax;
            my $tempRadial;
            @infor = split(/\t/, $icages_txt{$key}{$geneKey});
            $tempMutationSyntax = $infor[0];
            $tempProteinSyntax = $infor[1];
            $tempRadial = $infor[2];
            $tempMutationSyntax = "\"NA\"" unless defined $tempMutationSyntax;
            $tempProteinSyntax = "\"NA\"" unless defined $tempProteinSyntax;
            $tempRadial = "\"NA\"" unless defined $tempRadial;
            
            $iMutation ++;
            if($iMutation < $mutationCountEachGene){
                $genePrintJSONInfor = $genePrintJSONInfor . "{\n\"mutationSyntax\":\"$tempMutationSyntax\", \n \"proteinSyntax\":\"$tempProteinSyntax\", \n \"radial\": $tempRadial},";
                $mutationSyntax .= "$tempMutationSyntax,";
                $proteinSyntax .= "$tempProteinSyntax,";
                $radial .= "$tempRadial,";
            }else{
                $genePrintJSONInfor = $genePrintJSONInfor . "{\n\"mutationSyntax\":\"$tempMutationSyntax\", \n \"proteinSyntax\":\"$tempProteinSyntax\", \n \"radial\": $tempRadial}";
                $mutationSyntax .= "$tempMutationSyntax";
                $proteinSyntax .= "$tempProteinSyntax";
                $radial .= "$tempRadial";
            }
	    }
        
        $genePrintTXTInfor = $genePrintTXTInfor . "$mutationSyntax\t$proteinSyntax\t$radial";
        
        ################ print information for each gene #################

        if($iGene < $geneNumber){
            if(exists $cgc{$key}){
                print TXT "$key\t$genePrintTXTInfor\t$hui{$key}\t$icages{$key}[0]\tcancer gene census\thttp://cancer.sanger.ac.uk/cosmic/gene/overview?ln=$key\t$icages{$key}[1]\n";
                print JSON "{\n\"gene\": \"$key\",\n\"mutation\":[$genePrintJSONInfor],\n\"phenolyzer\":$hui{$key},\n\"icages\":$icages{$key}[0],\n\"category\":\"cancer gene census\",\n\"url\":\"http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=$key\",\n\"driver\":$icages{$key}[1]\n},";
                $iCgc ++;
            }elsif(exists $kegg{$key}){
                print TXT "$key\t$genePrintTXTInfor\t$hui{$key}\t$icages{$key}[0]\tkegg cancer pathway\thttp://www.genome.jp/dbget-bin/www_bget?hsa:$kegg{$key}\t$icages{$key}[1]\n";
                print JSON "{\n\"gene\": \"$key\",\n\"mutation\":[$genePrintJSONInfor],\n\"phenolyzer\":$hui{$key},\n\"icages\":$icages{$key}[0],\n\"category\":\"kegg cancer pathway\",\n\"url\":\"http://www.genome.jp/dbget-bin/www_bget?hsa:$kegg{$key}\",\n\"driver\":$icages{$key}[1]\n},";
                $iKegg ++;
            }else{
                print TXT "$key\t$genePrintTXTInfor\t$hui{$key}\t$icages{$key}[0]\tneither\thttp://www.genecards.org/cgi-bin/carddisp.pl?gene=$key&search=96a88d95c4a24ffc2ac1129a92af7b02\t$icages{$key}[1]\n";
                print JSON "{\n\"gene\": \"$key\",\n\"mutation\":[$genePrintJSONInfor],\n\"phenolyzer\":$hui{$key},\n\"icages\":$icages{$key}[0],\n\"category\":\"neither\",\n\"url\":\"http://www.genecards.org/cgi-bin/carddisp.pl?gene=$key&search=96a88d95c4a24ffc2ac1129a92af7b02\",\n\"driver\":$icages{$key}[1]\n},";
            }
        }else{
            if(exists $cgc{$key}){
                print TXT "$key\t$genePrintTXTInfor\t$hui{$key}\t$icages{$key}[0]\tcancer gene census\thttp://cancer.sanger.ac.uk/cosmic/gene/overview?ln=$key\t$icages{$key}[1]\n";
                print JSON "{\n\"gene\": \"$key\",\n\"mutation\":[$genePrintJSONInfor],\n\"phenolyzer\":$hui{$key},\n\"icages\":$icages{$key}[0],\n\"category\":\"cancer gene census\",\n\"url\":\"http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=$key\",\n\"driver\":$icages{$key}[1]\n}";
                $iCgc ++;
            }elsif(exists $kegg{$key}){
                print TXT "$key\t$genePrintTXTInfor\t$hui{$key}\t$icages{$key}[0]\tkegg cancer pathway\thttp://www.genome.jp/dbget-bin/www_bget?hsa:$kegg{$key}\t$icages{$key}[1]\n";
                print JSON "{\n\"gene\": \"$key\",\n\"mutation\":[$genePrintJSONInfor],\n\"phenolyzer\":$hui{$key},\n\"icages\":$icages{$key}[0],\n\"category\":\"kegg cancer pathway\",\n\"url\":\"http://www.genome.jp/dbget-bin/www_bget?hsa:$kegg{$key}\",\n\"driver\":$icages{$key}[1]\n}";
                $iKegg ++;
            }else{
                print TXT "$key\t$genePrintTXTInfor\t$hui{$key}\t$icages{$key}[0]\tneither\thttp://www.genecards.org/cgi-bin/carddisp.pl?gene=$key&search=96a88d95c4a24ffc2ac1129a92af7b02\t$icages{$key}[1]\n";
                print JSON "{\n\"gene\": \"$key\",\n\"mutation\":[$genePrintJSONInfor],\n\"phenolyzer\":$hui{$key},\n\"icages\":$icages{$key}[0],\n\"category\":\"neither\",\n\"url\":\"http://www.genecards.org/cgi-bin/carddisp.pl?gene=$key&search=96a88d95c4a24ffc2ac1129a92af7b02\",\n\"driver\":$icages{$key}[1]\n}";
            }
        };
        
        
        
        ############### number of cancer driver genes ##############
        $iDriver ++ if $icages{$key}[1] eq "true";
	}

}else{
    print LOG "WARNING: not enough mutations for analysis, please make sure there are more than 1 non-synonymous mutations\n";
    print LOG "WARNING: no genes is given iCAGES score\n";
}

print JSON "\n]";

$nowString = localtime;



print LOG "SUMMARY: your data contain $iMissense missense mutations harbored in $iGene genes. Among these genes, $iDriver are predicted to be cancer driver genes, $iCgc belong to Cancer Gene Census and $iKegg belong to KEGG cancer gene pathway\n";
print "SUMMARY: your data contain $iMissense missense mutations harbored in $iGene genes. Among these genes, $iDriver are predicted to be cancer driver genes, $iCgc belong to Cancer Gene Census and $iKegg belong to KEGG cancer gene pathway\n";

print LOG "iCAGES: finished at $nowString\n";
print "NOTICE: finished at $nowString\n";



######################################################################################################################################
############################################################ manual page #############################################################
######################################################################################################################################

=head1 NAME                                                                                                                                                                                                                                                                 
           
 iCAGES (integrated CAncer GEnome Score) command line package for web interface.
                                                              
=head1 SYNOPSIS
                                                                                                                                                                                                      
 icages.pl [options] <input>                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                                               
 Options:                                                                                                                                                                                                                                                                     
        -h, --help                      print help message   
        -m, --manual                    print manual message
        -p, --percent <float>           percentile above which deleterious mutations are selected to determine the candidate cancer driver genes for each patient (default: 80)          
        -i, --id <int>                  id number of the user
                                                                                                                                                                                                                                                              
 Function: iCAGES predicts cancer driver genes given protein altering somatic mutations from a patient.                                                                                                                                                                        
                                                                                                                                                                                                                                                                               
 Example: icages.pl -i 5000 /path/to/input /path/to/output /path/to/temp /path/to/log
                                                                                                                                                                                                                                                                               
 Input: configuration file                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                               
 Version: 1.0

 Last update: Wed Aug 20 19:47:38 PDT 2014
 
=head1 OPTIONS

=over 8

=item B<--help>

 print a brief usage message and detailed explanation of options.

=item B<--manual>

 print the manual page and exit.

=back

=cut

