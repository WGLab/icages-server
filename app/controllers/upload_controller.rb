class UploadController < ApplicationController 
  protect_from_forgery except: :handle_uplaod
  before_filter :add_headers, :only => [:handle_upload, :options]

  def options
    head :ok
  end
    

  def handle_upload

    inputData = params[:inputData]

    inputFile = params[:inputFile]
    
    logger.debug "Input file is [#{'empty' if inputFile.nil?}].." 

    if inputData
      submission = Submission.create(done: false)
      Thread.new { exec_query(submission.id, inputData, {isFile: false}) }
      render json: {id: submission.id, msg:"Submission: #{submission.id} created"}
    elsif inputFile
      submission = Submission.create(done: false)
      Thread.new { exec_query(submission.id, inputFile, {isFile: true}) }
      render json: {id: submission.id, msg: "File: #{inputFile.original_filename} uploaded, Submission: #{submission.id} created"}
    end
    
  end

  private 
  
  def exec_query(id, data, opts)
    working_dir = Rails.root
    input_file = working_dir.join('public', 'uploads', 'input.txt')
    File.open(input_file,'w') do |file|
      file.write(opts[:isFile] ? data.read : data)
    end
   
    results_dir = working_dir.join('public', 'results')
    script = working_dir.join('public','script','mockscript.rb')
    `ruby #{script} > #{results_dir}/result-#{id}.json`
    
    submission = Submission.find(id)
    submission.update(done: true)
    
  end

  def add_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST OPTIONS'
    headers['Access-Control-Request-Method'] = '*'
    headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  end
end
