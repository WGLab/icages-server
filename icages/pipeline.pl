#!/usr/bin/perl                                         
# vcf 
# pipeline.pl                                                                                                         

use strict;
use warnings;
use List::Util qw(min max);	

my $inputFile = "/home/cocodong/project/iCAGES/pipeline/input.txt";
my $outputFile="$inputFile.annovar.txt";
my $annovar="/home/cocodong/usr/annovar/humandb/";
my $gene="$inputFile.annovar.txt.exonic_variant_function";
my $hui ="/home/cocodong/project/iCAGES/pipeline/hui.score";
my $output = "/home/cocodong/project/iCAGES/pipeline/result.json";
my $icages="$inputFile.annovar.txt.hg19_iCAGES_dropped";


my $cgc ="/home/cocodong/project/iCAGES/pipeline/cgc";
my $kegg ="/home/cocodong/project/iCAGES/pipeline/kegg";


open(IN, "$inputFile") or die "cannot open file $inputFile\n";

my $line=<IN>;
chomp $line;
close IN;
if($line =~ /^#/){
    !system("/home/cocodong/usr/annovar/convert2annovar.pl -format vcf4 $inputFile > $outputFile") or die;
}else{
    !system("cp $inputFile $outputFile") or die;
}

!system("/home/cocodong/usr/annovar/annotate_variation.pl -filter -out $outputFile -build hg19 -dbtype iCAGES $outputFile $annovar") or die;
!system("/home/cocodong/usr/annovar/annotate_variation.pl -out $outputFile -build hg19 $outputFile $annovar") or die;


open(GENE, "$gene") or die "cannot open file $gene:$!\n";
open(HUI, "$hui") or die "cannot open file $hui:$!\n";
open(OUT, ">$output") or die "cannot open file $output:$!\n"; 

open(ICAGES, "$icages") or die "cannot open file $icages:$!\n";
open(CGC, "$cgc") or die "cannot open file $cgc:$!\n";
open(KEGG, "$kegg") or die "cannot open file $kegg:$!\n";

my %ref;
my $linetitle=<ICAGES>;
while(<ICAGES>){
    chomp;
    my @line = split(/\t/, $_);
    my $key = "$line[2]:$line[3]:$line[5]:$line[6]";
    $ref{$key} = $line[1];
}

my %gene;  #gene->icages(total), icages(highest) 

while(<GENE>){
    chomp;
    my @line = split(/\t/, $_);
    next unless $line[1] eq "nonsynonymous SNV";
    my $key = "$line[3]:$line[4]:$line[6]:$line[7]";
    my $mygene = $line[2];
    $mygene =~ /^([\w|\d]+?):/;
    $mygene = $1;
    next unless defined $mygene;
    if(exists $gene{$mygene}[0] and exists $ref{$key}){
	$gene{$mygene}[0] = $gene{$mygene}[0] + $ref{$key};
	$gene{$mygene}[1] = max($gene{$mygene}[1], $ref{$key});
    }elsif(exists $ref{$key}){
	$gene{$mygene}[0] = $ref{$key};
	$gene{$mygene}[1] = $ref{$key};
    };
}

my %hui;  #gene->hui,percent

my $min_zero = 10;
my $max_zero = 0;

my $min_one = 10;
my $max_one = 0;

while(<HUI>){
    chomp;
    my @line = split(/\t/, $_);
    $hui{$line[0]} = $line[1];
    $max_zero = max($line[1], $max_zero); #max_zero means the largest score in hui
    $min_zero = min($line[1], $min_zero);
}

my $numyes = 0;
my @mut_unsort;

foreach my $key (keys %gene){
    if(exists $hui{$key} ){
	$gene{$key}[0] = $gene{$key}[0]*$hui{$key};
	$gene{$key}[1] = $gene{$key}[1]*$hui{$key};
    }else{
	$gene{$key}[0] = $gene{$key}[0]*rand($min_zero);
    	$gene{$key}[1] = $gene{$key}[1]*rand($min_zero);
    }
    push @mut_unsort, $gene{$key}[1];
}

my @mut_sort = sort {$a <=> $b} @mut_unsort;
my $given_percentage_length = int(($#mut_sort + 1) * 0.2); #80%
my $given_percentage_score = $mut_sort[$given_percentage_length];
my ($max_gene, $min_gene);


foreach my $key (keys %gene){
    if($gene{$key}[1] >= $given_percentage_score){
	    $gene{$key}[1] = "y";
	    $numyes ++;
    }else{
	    $gene{$key}[1] = "n";
    }
    $min_gene = min($min_gene, $gene{$key}[0]); # highest and lowest score in gene for normalization
    $max_gene = max($max_gene, $gene{$key}[0]);
}

my $i = 0;	 

my %kegg;
my %cgc;

while(<KEGG>){
    chomp;
    chomp;
    chomp;
    chomp;
    chomp;
    chomp;
    chomp;
    my @line = split;
    $kegg{$line[0]} = $line[1];
}

while(<CGC>){
    chomp;
    my @line = split;
    $cgc{$line[0]} = 1;
}

print OUT "{\n\"children\": [\n";


foreach my $key (sort { $gene{$b}[0] <=> $gene{$a}[0] } keys %gene){
    next unless $gene{$key}[1] eq "y";
    $gene{$key}[0] = ($gene{$key}[0] - $min_gene)/($max_gene-$min_gene);
    $i++;    
    if($i < $numyes){
	if(exists $cgc{$key}){
	    print OUT "{\n\"name\": \"$key\",\n\"value\":$gene{$key}[0],\n\"color\":\"red\",\n\"url\":\"http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=$key\"\n},";
        }elsif(exists $kegg{$key}){
            print OUT "{\n\"name\": \"$key\",\n\"value\":$gene{$key}[0],\n\"color\":\"blue\",\n\"url\":\"http://www.genome.jp/dbget-bin/www_bget?hsa:$kegg{$key}\"\n},";
        }else{
 	    print OUT "{\n\"name\": \"$key\",\n\"value\":$gene{$key}[0],\n\"color\":\"black\",\n\"url\":\"http://www.genecards.org/cgi-bin/carddisp.pl?gene=$key&search=96a88d95c4a24ffc2ac1129a92af7b02\"\n},";
        }
    }else{
        if(exists $cgc{$key}){
	    print OUT "{\n\"name\": \"$key\",\n\"value\":$gene{$key}[0],\n\"color\":\"red\",\n\"url\":\"http://cancer.sanger.ac.uk/cosmic/gene/overview?ln=$key\"\n}";
	}elsif(exists $kegg{$key}){
	    print OUT "{\n\"name\": \"$key\",\n\"value\":$gene{$key}[0],\n\"color\":\"blue\",\n\"url\":\"http://www.genome.jp/dbget-bin/www_bget?hsa:$kegg{$key}\"\n}";
	}else{
	    print OUT "{\n\"name\": \"$key\",\n\"value\":$gene{$key}[0],\n\"color\":\"black\",\n\"url\":\"http://www.genecards.org/cgi-bin/carddisp.pl?gene=$key&search=96a88d95c4a24ffc2ac1129a92af7b02\"\n}";
	}
    };
}

print OUT "]\n}";

