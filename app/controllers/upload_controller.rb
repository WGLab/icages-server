class UploadController < ApplicationController
  protect_from_forgery except: :handle_uplaod
  before_filter :add_headers, :only => :handle_upload

  def handle_upload
    inputData = params[:inputData]
    
    submission = Submission.create(done: false)

    Thread.new { exec_query(submission.id, inputData) }

    render text: "#{submission.id}"
    
  end

  private 
  
  def exec_query(id, inputData)
    working_dir = Rails.root
    input_file = working_dir.join('public', 'uploads', 'input.txt')
    File.open(input_file,'w') do |file|
      file.write(inputData)
    end
   
    results_dir = working_dir.join('public', 'results')
    script = working_dir.join('public','script','mockscript.rb')
    `ruby #{script} > #{results_dir}/result-#{id}.json`
    
    submission = Submission.find(id)
    submission.update(done: true)
    
  end



  def add_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST'
    headers['Access-Control-Request-Method'] = '*'
    headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  end
end
