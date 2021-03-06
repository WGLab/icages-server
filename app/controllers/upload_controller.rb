require_relative '../jobs/query_job'

class UploadController < ApplicationController
  protect_from_forgery except: :handle_upload
  before_filter :add_cross_origin_headers, :only => [:handle_upload, :options]
  Thread::abort_on_exception = true

  def index
  end

  def options
    head :ok
  end

  def handle_upload

    inputData = params[:inputData]
    inputFile = params[:inputFile]
    isFileUpload = false

    logger.debug "Input file is [#{inputFile.nil? ? 'empty' : inputFile.original_filename}].."

    email = params[:email]

    emailMsg = (!email || email.empty?) ? '':'for ' + email

    submission = Submission.create(done: false, email: email)

    responseMsg = ""
    if inputData && !inputData.empty?
      responseMsg = "Submission: #{submission.id} created #{emailMsg}"
    else
      responseMsg = "File: #{inputFile.original_filename} uploaded, Submission: #{submission.id} created #{emailMsg}"
      isFileUpload = true
    end

    exec_query(submission.id, isFileUpload, params)

    render json: {id: submission.id, msg: responseMsg, url: "#{result_path(submission, only_path: false)}"}

  end

  private

  def getShell(scriptConfig, params, inputFilePath, inputBedFilePaths, fileOptions)

    options = {
      :tumorSampleID => "-t",
      :gemlineSampleID => "-g",
      :multiSampleID => "-i",
      :subtype => "-s",
      :referenceGenome => "--buildver"
    }

    perlCmd = "perl #{scriptConfig['path']}"

    inputBedFilePaths.each do |key, val|
      perlCmd += " #{fileOptions[key]} #{val}"
    end

    options.each do |k, v|
      if params[k] && !params[k].empty?
        perlCmd += " #{v} #{params[k]}"
      end
    end

    perlCmd += " --logdir #{scriptConfig['log_dir']} --tempdir #{scriptConfig['temp_dir']} --outputdir #{scriptConfig['output_dir']} #{inputFilePath}"
  end

  def exec_query(id, isFileUpload, params)

    logger.debug params

    scriptConfig = CONFIG['script']

    fileOptions = {:inputSVBedFile => "-b", :inputGEBedFile => "-e"}

    inputFilePath = scriptConfig['input_dir'] + "/input-#{id}"
    File.open(inputFilePath,'w') do |file|
      file.write(isFileUpload ? params[:inputFile].read : params[:inputData])
    end

    inputBedFilePaths = {}

    fileOptions.each do |key, val|
      if params[key]
        path = scriptConfig['input_dir'] + "/#{key}-#{id}"
        File.open(path, 'w') do |file|
          file.write(params[key].read)
        end
        inputBedFilePaths[key] = path
      end
    end

    perlCmd = getShell(scriptConfig, params, inputFilePath, inputBedFilePaths, fileOptions)

    logger.debug perlCmd

    QueryJob.perform_later(perlCmd, id, scriptConfig['output_dir'])

  end

end

