#!/usr/bin/perl
use strict;
use warnings;
use Pod::Usage;
use Getopt::Long;

######################################################################################################################################
######################################################## variable declaration ########################################################
######################################################################################################################################
my ($id, $input_dir, $output_dir, $temp_dir, $log_dir);
my $inputFile;

######################################################################################################################################
############################################################# main  ##################################################################
######################################################################################################################################
($id, $input_dir, $output_dir, $temp_dir, $log_dir) =  &processArguments();
&runIcages($id, $input_dir);
&moveFiles($id, $input_dir, $output_dir, $temp_dir, $log_dir);

######################################################################################################################################
########################################################## subroutines ###############################################################
######################################################################################################################################

sub processArguments {
    my ($help, $manual, $id, $input_dir, $output_dir, $temp_dir, $log_dir);
    GetOptions( 'help|h' => \$help,
    'manual|man|m' => \$manual,
    'id|i=i' => \$id
    )or pod2usage ();
    ######################## arguments ########################
    $help and pod2usage (-verbose=>1, -exitval=>1, -output=>\*STDOUT);
    $manual and pod2usage (-verbose=>2, -exitval=>1, -output=>\*STDOUT);
    @ARGV == 4 or pod2usage ();
    ################### locations ########################
    $input_dir = $ARGV[0];
    $output_dir = $ARGV[1];
    $temp_dir = $ARGV[2];
    $log_dir = $ARGV[3];
    return ($id, $input_dir, $output_dir, $temp_dir, $log_dir);
}

sub runIcages{
    my $inputFile;
    my @children_pids;
    my $id = shift;
    my $input_dir = shift;
    $inputFile = "$input_dir/input-$id.txt";
    $children_pids[0] = fork();
    if($children_pids[0] == 0){
        !system("perl icages.pl $inputFile") or die "ERROR: cannot run iCAGES\n";
        exit 0;
    }
    for (0.. $#children_pids){
        waitpid($children_pids[$_], 0);
    }
}


sub moveFiles{
    my ($id, $input_dir, $output_dir, $temp_dir, $log_dir);
    my ($output_file_dest, $temp_file_dest, $log_file_dest, $json_file_dest);
    my ($input_file, $output_file, $temp_file, $log_file, $json_file);
    $id = shift;
    $input_dir = shift;
    $output_dir = shift;
    $temp_dir = shift;
    $log_dir = shift;
    $input_file = "$input_dir/input-$id.txt";
    $output_file = "$input_dir/input-$id.*csv";
    $temp_file = "$input_dir/input-$id.*";
    $log_file = "$input_dir/input-$id.*log";
    $json_file = "$input_dir/input-$id.icages.json";
    ## output destination
    $output_file_dest = "$output_dir/input-$id.*csv";
    $temp_file_dest = "$temp_dir/input-$id.*";
    $log_file_dest = "$log_dir/input-$id.*log";
    $json_file_dest = "$output_dir/input-$id.icages.json";
    !system("mv $output_file $output_file_dest") or die "ERROR: cannot move iCAGES file\n";
    !system("mv $temp_file $temp_file_dest") or die "ERROR: cannot move iCAGES file\n";
    !system("mv $log_file $log_file_dest") or die "ERROR: cannot move iCAGES file\n";
    !system("mv $json_file $json_file_dest") or die "ERROR: cannot move iCAGES file\n";
}
















